package com.ai.accessibility.service;

import com.ai.accessibility.entity.NormalizedJobEntity;
import com.ai.accessibility.entity.UserEntity;
import com.ai.accessibility.model.JobRecommendationResponse;
import com.ai.accessibility.model.NormalizedJob;
import com.ai.accessibility.repository.jpa.NormalizedJobJpaRepository;
import com.ai.accessibility.repository.jpa.UserJpaRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * AI Recommendation Engine — DB-First Architecture.
 *
 * Primary Principle:
 *  - PostgreSQL is the PRIMARY source of job data.
 *  - External APIs are INGESTION sources, never called on every user request.
 *
 * Flow:
 *  1. User Request → Check PostgreSQL for fresh relevant jobs (fetchedAt within freshness cutoff).
 *  2. Case A: If fresh active jobs >= MIN_RECOMMENDATION_JOBS:
 *     → Serve directly from PostgreSQL (NO external API calls!).
 *  3. Case B: If fresh active jobs < MIN_RECOMMENDATION_JOBS:
 *     → Ingest from available external job APIs → Normalize → Deduplicate → PostgreSQL.
 *  4. Case C: If external APIs fail or are unavailable:
 *     → Fall back gracefully to existing PostgreSQL jobs without crashing.
 *  5. Run AI Recommendation matching on normalized jobs + user profile + resume.
 */
@Service
public class JobRecommendationService {

    private static final Logger log = LoggerFactory.getLogger(JobRecommendationService.class);

    private static final String GEMINI_API_BASE =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    private static final Duration GEMINI_TIMEOUT = Duration.ofSeconds(6);

    @Value("${app.jobs.freshness-hours:6}")
    private int freshnessHours;

    @Value("${app.jobs.min-recommendation-jobs:20}")
    private int minRecommendationJobs;

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    private final NormalizedJobJpaRepository jobRepo;
    private final UserJpaRepository userRepo;
    private final JobAggregatorService aggregatorService;
    private final ContextEngineClient contextEngineClient;
    private final ResumeService resumeService;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public JobRecommendationService(NormalizedJobJpaRepository jobRepo,
                                    UserJpaRepository userRepo,
                                    JobAggregatorService aggregatorService,
                                    ContextEngineClient contextEngineClient,
                                    ResumeService resumeService,
                                    WebClient.Builder webClientBuilder,
                                    ObjectMapper objectMapper) {
        this.jobRepo = jobRepo;
        this.userRepo = userRepo;
        this.aggregatorService = aggregatorService;
        this.contextEngineClient = contextEngineClient;
        this.resumeService = resumeService;
        this.webClient = webClientBuilder
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.objectMapper = objectMapper;
    }

    /**
     * Compute AI job recommendations for the authenticated user using DB-First logic.
     *
     * @param userId Authenticated user ID
     * @return Ranked list of recommended jobs with scores, breakdowns, and explanations
     */
    public List<JobRecommendationResponse> recommend(String userId) {
        log.info("Job Recommendation: Processing request for user '{}'", userId);

        // 1. Load user profile
        Optional<UserEntity> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            log.warn("Job Recommendation: User '{}' not found", userId);
            return Collections.emptyList();
        }
        UserEntity user = userOpt.get();

        // 2. Load candidate jobs from PostgreSQL (DB-First with Freshness Policy)
        List<NormalizedJobEntity> candidateJobs = getCandidateJobsWithFreshnessPolicy(user);

        if (candidateJobs.isEmpty()) {
            log.warn("Job Recommendation: No candidate jobs available in PostgreSQL for user '{}'", userId);
            return Collections.emptyList();
        }

        // 3. Load user skills and resume text
        List<String> userSkills = user.getSkills() != null ? user.getSkills() : Collections.emptyList();
        String resumeText = loadResumeText(userId, user);

        log.info("Job Recommendation: Scoring {} candidate jobs against profile/resume for user '{}'",
                candidateJobs.size(), userId);

        // 4. Run AI matching on normalized jobs
        List<JobRecommendationResponse> recommendations = new ArrayList<>();
        for (NormalizedJobEntity entity : candidateJobs) {
            try {
                JobRecommendationResponse scored = scoreJob(entity, user, userSkills, resumeText);
                if (scored != null) {
                    recommendations.add(scored);
                }
            } catch (Exception e) {
                log.warn("Job Recommendation: Error scoring job '{}': {}", entity.getId(), e.getMessage());
            }
        }

        // 5. Rank by matchScore descending and return top 10
        return recommendations.stream()
                .sorted(Comparator.comparingInt(JobRecommendationResponse::getMatchScore).reversed())
                .limit(10)
                .collect(Collectors.toList());
    }

    // -----------------------------------------------------------------------
    // DB-First Freshness & Fallback Engine
    // -----------------------------------------------------------------------

    private List<NormalizedJobEntity> getCandidateJobsWithFreshnessPolicy(UserEntity user) {
        Date cutoffDate = Date.from(Instant.now().minus(Duration.ofHours(freshnessHours)));

        // Step 1: Check how many fresh active jobs exist in PostgreSQL
        long freshCount = jobRepo.countFreshActiveJobs(cutoffDate);
        log.info("Job Recommendation: PostgreSQL check — {} fresh jobs found (threshold: {}, freshness cutoff: {}h)",
                freshCount, minRecommendationJobs, freshnessHours);

        // Case A: Enough fresh jobs exist in PostgreSQL -> DO NOT call external APIs
        if (freshCount >= minRecommendationJobs) {
            log.info("Job Recommendation: Case A — Sufficient fresh jobs in DB ({} >= {}). Serving directly from PostgreSQL.",
                    freshCount, minRecommendationJobs);
            return jobRepo.findFreshActiveJobs(cutoffDate).stream()
                    .limit(50)
                    .collect(Collectors.toList());
        }

        // Case B: Insufficient fresh jobs in PostgreSQL -> Ingest from external APIs
        log.info("Job Recommendation: Case B — Insufficient fresh jobs ({} < {}). Triggering external ingestion...",
                freshCount, minRecommendationJobs);

        String searchKeyword = determineSearchKeyword(user);
        String searchLocation = user.getLocation() != null ? user.getLocation() : "remote";

        try {
            int ingestedCount = aggregatorService.fetchAndStore(searchKeyword, searchLocation);
            log.info("Job Recommendation: Ingestion completed — {} jobs added/updated in PostgreSQL", ingestedCount);
        } catch (Exception e) {
            // Case C: External API error -> Fallback gracefully to existing DB jobs
            log.error("Job Recommendation: Case C — External API ingestion encountered error: {}. Falling back to PostgreSQL stored jobs.",
                    e.getMessage());
        }

        // Re-query PostgreSQL for all active jobs (newly ingested + existing stored)
        List<NormalizedJobEntity> activeJobs = jobRepo.findAllActiveJobsOrderByNewest();

        if (activeJobs.isEmpty()) {
            log.warn("Job Recommendation: No active jobs found in PostgreSQL after ingestion attempt");
        } else {
            log.info("Job Recommendation: Retaining {} active jobs from PostgreSQL for scoring",
                    Math.min(activeJobs.size(), 50));
        }

        return activeJobs.stream().limit(50).collect(Collectors.toList());
    }

    private String determineSearchKeyword(UserEntity user) {
        if (user.getHeadline() != null && !user.getHeadline().isBlank()) {
            return user.getHeadline();
        }
        if (user.getSkills() != null && !user.getSkills().isEmpty()) {
            return user.getSkills().get(0) + " developer";
        }
        return "software engineer";
    }

    // -----------------------------------------------------------------------
    // AI Match Scoring & Explanation
    // -----------------------------------------------------------------------

    private JobRecommendationResponse scoreJob(NormalizedJobEntity entity,
                                                UserEntity user,
                                                List<String> userSkills,
                                                String resumeText) {
        String jobDescription = entity.getDescription() != null ? entity.getDescription() : "";

        // 1. Context Engine match (TF-IDF / Embeddings)
        Map<String, Object> matchResult = contextEngineClient.matchJob(
                userSkills, resumeText, jobDescription, false);

        double rawTfidfScore = extractDouble(matchResult, "match_score", 0.5);
        @SuppressWarnings("unchecked")
        List<String> matchedSkills = (List<String>) matchResult.getOrDefault("matched_skills", Collections.emptyList());
        @SuppressWarnings("unchecked")
        List<String> missingSkills = (List<String>) matchResult.getOrDefault("missing_skills", Collections.emptyList());

        // 2. Compute individual dimensional scores
        int skillScore = calculateSkillScore(userSkills, entity.getSkills(), matchedSkills);
        int locationScore = calculateLocationScore(user.getLocation(), entity.getLocation());
        int experienceScore = calculateExperienceScore(resumeText, jobDescription);
        int preferenceScore = calculatePreferenceScore(user, entity);

        // 3. Weighted overall score calculation
        // Skills: 35%, Content Match: 30%, Location: 20%, Experience: 10%, Preferences: 5%
        int overallScore = (int) Math.round(
                skillScore * 0.35 +
                (rawTfidfScore * 100) * 0.30 +
                locationScore * 0.20 +
                experienceScore * 0.10 +
                preferenceScore * 0.05
        );
        overallScore = Math.min(100, Math.max(0, overallScore));

        Map<String, Integer> breakdown = new LinkedHashMap<>();
        breakdown.put("skills", skillScore);
        breakdown.put("experience", experienceScore);
        breakdown.put("location", locationScore);
        breakdown.put("preferences", preferenceScore);

        // 4. Generate AI explanation
        String explanation = generateExplanation(user, entity, overallScore, matchedSkills, missingSkills);

        // 5. Build normalized response DTO
        NormalizedJob jobDto = toDto(entity);
        return new JobRecommendationResponse(jobDto, overallScore, breakdown, explanation);
    }

    private int calculateSkillScore(List<String> userSkills, List<String> jobSkills, List<String> matchedSkills) {
        if (userSkills.isEmpty()) return 50;

        if (!matchedSkills.isEmpty()) {
            List<String> combined = new ArrayList<>(jobSkills);
            combined.addAll(matchedSkills);
            long matches = matchedSkills.size();
            long total = Math.max(combined.stream().distinct().count(), 1);
            return (int) Math.min(100, (matches * 100) / total);
        }

        long count = userSkills.stream()
                .filter(s -> !s.isBlank())
                .filter(s -> jobSkills.stream().anyMatch(js -> js.equalsIgnoreCase(s)))
                .count();
        return (int) Math.min(100, (count * 100) / userSkills.size());
    }

    private int calculateLocationScore(String userLocation, String jobLocation) {
        if (jobLocation == null || jobLocation.isBlank()) return 50;
        String jl = jobLocation.toLowerCase();
        if (jl.contains("remote") || jl.contains("work from home")) return 100;
        if (userLocation == null || userLocation.isBlank()) return 50;
        String ul = userLocation.toLowerCase();
        if (jl.equals(ul)) return 100;

        String[] parts = ul.split("[,\\s]+");
        for (String p : parts) {
            if (p.length() > 2 && jl.contains(p)) return 85;
        }
        return 35;
    }

    private int calculateExperienceScore(String resumeText, String jobDescription) {
        if (resumeText == null || resumeText.isBlank() || jobDescription == null) return 50;
        String jd = jobDescription.toLowerCase();
        String rt = resumeText.toLowerCase();

        int userYears = extractYearsOfExperience(rt);
        int requiredYears = extractRequiredYears(jd);

        if (requiredYears == 0) return 80; // Entry/unspecified
        if (userYears == 0) return 50;

        if (userYears >= requiredYears) return 100;
        return (int) Math.round(((double) userYears / requiredYears) * 80);
    }

    private int calculatePreferenceScore(UserEntity user, NormalizedJobEntity job) {
        int score = 50;
        String jobLoc = job.getLocation() != null ? job.getLocation().toLowerCase() : "";
        String jobDesc = job.getDescription() != null ? job.getDescription().toLowerCase() : "";

        if (jobLoc.contains("remote") || jobDesc.contains("remote")) {
            score += 30;
        }

        String empType = job.getEmploymentType();
        if (empType != null && user.getSummary() != null) {
            String summary = user.getSummary().toLowerCase();
            if (empType.equalsIgnoreCase("full-time") && summary.contains("full-time")) score += 20;
            if (empType.equalsIgnoreCase("internship") && summary.contains("intern")) score += 20;
        }

        return Math.min(100, score);
    }

    // -----------------------------------------------------------------------
    // AI Explanation via Gemini
    // -----------------------------------------------------------------------

    private String generateExplanation(UserEntity user,
                                        NormalizedJobEntity job,
                                        int overallScore,
                                        List<String> matchedSkills,
                                        List<String> missingSkills) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            return defaultExplanation(overallScore, matchedSkills);
        }

        try {
            String prompt = buildExplanationPrompt(user, job, overallScore, matchedSkills, missingSkills);

            Map<String, Object> part = Map.of("text", prompt);
            Map<String, Object> content = Map.of("parts", List.of(part));
            Map<String, Object> requestBody = Map.of("contents", List.of(content));

            String url = GEMINI_API_BASE + "?key=" + geminiApiKey.trim();

            String response = webClient.post()
                    .uri(url)
                    .body(BodyInserters.fromValue(requestBody))
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(GEMINI_TIMEOUT)
                    .block();

            if (response != null) {
                JsonNode root = objectMapper.readTree(response);
                JsonNode text = root.path("candidates").path(0)
                        .path("content").path("parts").path(0).path("text");
                if (!text.isMissingNode()) {
                    return text.asText().trim();
                }
            }
        } catch (Exception e) {
            log.debug("Job Recommendation: Gemini explanation unavailable: {}", e.getMessage());
        }

        return defaultExplanation(overallScore, matchedSkills);
    }

    private String buildExplanationPrompt(UserEntity user, NormalizedJobEntity job,
                                           int overallScore, List<String> matchedSkills,
                                           List<String> missingSkills) {
        return String.format("""
            You are a helpful job advisor. In 2-3 concise sentences, explain why this job is recommended for this candidate.
            Be specific about which skills match and why it is a good fit.
            Do NOT use markdown symbols or bullets. Write in plain text from a third-person perspective.
            
            Candidate Name: %s
            Candidate Skills: %s
            
            Job Title: %s
            Company: %s
            Location: %s
            Employment Type: %s
            
            Overall Match Score: %d/100
            Matched Skills: %s
            Missing Skills: %s
            """,
                user.getName() != null ? user.getName() : "Candidate",
                user.getSkills() != null ? String.join(", ", user.getSkills()) : "not specified",
                job.getTitle(),
                job.getCompany(),
                job.getLocation(),
                job.getEmploymentType(),
                overallScore,
                matchedSkills.isEmpty() ? "none detected" : String.join(", ", matchedSkills),
                missingSkills.isEmpty() ? "none detected" : String.join(", ", missingSkills)
        );
    }

    private String defaultExplanation(int overallScore, List<String> matchedSkills) {
        if (matchedSkills.isEmpty()) {
            return String.format(
                    "This job is recommended with a %d%% match based on your profile and resume relevance.", overallScore);
        }
        return String.format(
                "This job is recommended with a %d%% match because your skills in %s align strongly with the position requirements.",
                overallScore, String.join(", ", matchedSkills.subList(0, Math.min(3, matchedSkills.size()))));
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private String loadResumeText(String userId, UserEntity user) {
        try {
            List<com.ai.accessibility.model.Resume> resumes = resumeService.getUserResumes(userId);
            if (!resumes.isEmpty()) {
                com.ai.accessibility.model.Resume resume = resumes.get(0);
                StringBuilder sb = new StringBuilder();

                if (resume.getPersonalInfo() != null) {
                    Object summary = resume.getPersonalInfo().get("summary");
                    if (summary != null) sb.append(summary).append("\n");
                }

                if (resume.getSkills() != null) {
                    for (Object val : resume.getSkills().values()) {
                        if (val instanceof List<?> list) {
                            list.forEach(s -> sb.append(s).append(" "));
                        } else if (val != null) {
                            sb.append(val).append(" ");
                        }
                    }
                    sb.append("\n");
                }

                if (resume.getExperience() != null) {
                    for (Map<String, Object> exp : resume.getExperience()) {
                        if (exp.containsKey("position")) sb.append(exp.get("position")).append(" ");
                        if (exp.containsKey("company")) sb.append(exp.get("company")).append(" ");
                        if (exp.containsKey("description")) sb.append(exp.get("description")).append(" ");
                    }
                    sb.append("\n");
                }

                String text = sb.toString().trim();
                if (!text.isEmpty()) return text;
            }
        } catch (Exception e) {
            log.debug("Could not load resume for user '{}': {}", userId, e.getMessage());
        }

        StringBuilder sb = new StringBuilder();
        if (user.getSummary() != null) sb.append(user.getSummary()).append(" ");
        if (user.getSkills() != null) sb.append(String.join(" ", user.getSkills()));
        return sb.toString().trim();
    }

    private NormalizedJob toDto(NormalizedJobEntity e) {
        NormalizedJob job = new NormalizedJob();
        job.setId(e.getId());
        job.setTitle(e.getTitle());
        job.setCompany(e.getCompany());
        job.setLocation(e.getLocation());
        job.setDescription(e.getDescription());
        job.setSkills(e.getSkills());
        job.setSalary(e.getSalary());
        job.setEmploymentType(e.getEmploymentType());
        job.setSource(e.getSource());
        job.setSourceJobId(e.getSourceJobId());
        job.setApplyUrl(e.getApplyUrl());
        job.setPostedAt(e.getPostedAt());
        job.setFetchedAt(e.getFetchedAt());
        job.setExpiresAt(e.getExpiresAt());
        job.setIsActive(e.isActive());
        job.setCreatedAt(e.getCreatedAt());
        job.setUpdatedAt(e.getUpdatedAt());
        return job;
    }

    private double extractDouble(Map<String, Object> map, String key, double defaultValue) {
        Object val = map.get(key);
        if (val instanceof Number) return ((Number) val).doubleValue();
        return defaultValue;
    }

    private int extractYearsOfExperience(String text) {
        Pattern p = Pattern.compile("(\\d+)\\+?\\s*years?");
        Matcher m = p.matcher(text);
        int max = 0;
        while (m.find()) {
            try { max = Math.max(max, Integer.parseInt(m.group(1))); } catch (Exception ignored) {}
        }
        return max;
    }

    private int extractRequiredYears(String jd) {
        Pattern p = Pattern.compile("(\\d+)\\+?\\s*years?\\s*(of)?\\s*(experience|exp)");
        Matcher m = p.matcher(jd);
        if (m.find()) {
            try { return Integer.parseInt(m.group(1)); } catch (Exception ignored) {}
        }
        if (jd.contains("entry level") || jd.contains("junior") || jd.contains("fresher")) return 0;
        if (jd.contains("senior") || jd.contains("lead")) return 5;
        return 0;
    }
}

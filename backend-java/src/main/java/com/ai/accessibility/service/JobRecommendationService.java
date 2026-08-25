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

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * AI Recommendation Engine.
 *
 * Consumes ONLY the normalized {@link NormalizedJobEntity} model — it has
 * no knowledge of whether a job came from Jooble, Adzuna, or JSearch.
 *
 * Flow:
 *  1. Load user profile (skills, location, preferences)
 *  2. Load user's latest resume text from ResumeService
 *  3. For each NormalizedJob:
 *       a. Call Python context-engine /resume/match-job → raw match score + matched/missing skills
 *       b. Calculate per-dimension scores (skills, experience, location, preferences)
 *       c. Call Gemini API → human-readable explanation
 *  4. Sort by overall score descending, return top N
 */
@Service
public class JobRecommendationService {

    private static final Logger log = LoggerFactory.getLogger(JobRecommendationService.class);

    /** Maximum candidate jobs to score per request (avoids too many API calls) */
    private static final int MAX_CANDIDATES = 50;
    /** Maximum recommendations returned to the client */
    private static final int TOP_N = 10;

    private static final String GEMINI_API_BASE =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    @Value("${app.gemini.api-key}")
    private String geminiApiKey;

    private final NormalizedJobJpaRepository jobRepo;
    private final UserJpaRepository userRepo;
    private final ContextEngineClient contextEngineClient;
    private final ResumeService resumeService;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public JobRecommendationService(NormalizedJobJpaRepository jobRepo,
                                     UserJpaRepository userRepo,
                                     ContextEngineClient contextEngineClient,
                                     ResumeService resumeService,
                                     WebClient.Builder webClientBuilder,
                                     ObjectMapper objectMapper) {
        this.jobRepo = jobRepo;
        this.userRepo = userRepo;
        this.contextEngineClient = contextEngineClient;
        this.resumeService = resumeService;
        this.webClient = webClientBuilder
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.objectMapper = objectMapper;
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Compute job recommendations for a given user.
     *
     * @param userId Authenticated user ID
     * @return Sorted list of recommended jobs with scores and explanations
     */
    public List<JobRecommendationResponse> recommend(String userId) {
        log.info("Computing recommendations for user: {}", userId);

        // 1. Load user profile
        Optional<UserEntity> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", userId);
            return Collections.emptyList();
        }
        UserEntity user = userOpt.get();

        // 2. Load resume text (best-effort)
        String resumeText = loadResumeText(userId, user);
        List<String> userSkills = user.getSkills() != null ? user.getSkills() : Collections.emptyList();

        // 3. Load candidate jobs (most recent, capped)
        List<NormalizedJobEntity> candidates = jobRepo.findAllOrderByCreatedAtDesc()
                .stream()
                .limit(MAX_CANDIDATES)
                .collect(Collectors.toList());

        log.info("Scoring {} candidate jobs for user '{}'", candidates.size(), userId);

        // 4. Score each job
        List<JobRecommendationResponse> recommendations = new ArrayList<>();
        for (NormalizedJobEntity entity : candidates) {
            try {
                JobRecommendationResponse scored = scoreJob(entity, user, userSkills, resumeText);
                recommendations.add(scored);
            } catch (Exception e) {
                log.warn("Failed to score job '{}': {}", entity.getId(), e.getMessage());
            }
        }

        // 5. Sort by matchScore descending, return top N
        return recommendations.stream()
                .sorted(Comparator.comparingInt(JobRecommendationResponse::getMatchScore).reversed())
                .limit(TOP_N)
                .collect(Collectors.toList());
    }

    // -----------------------------------------------------------------------
    // Scoring
    // -----------------------------------------------------------------------

    private JobRecommendationResponse scoreJob(NormalizedJobEntity entity,
                                                UserEntity user,
                                                List<String> userSkills,
                                                String resumeText) {
        String jobDescription = entity.getDescription() != null ? entity.getDescription() : "";

        // --- 1. TF-IDF / embedding score via Python context-engine ---
        Map<String, Object> matchResult = contextEngineClient.matchJob(
                userSkills, resumeText, jobDescription, false);

        double rawMatchScore = extractDouble(matchResult, "match_score", 0.5);
        @SuppressWarnings("unchecked")
        List<String> matchedSkills = (List<String>) matchResult.getOrDefault("matched_skills", Collections.emptyList());
        @SuppressWarnings("unchecked")
        List<String> missingSkills = (List<String>) matchResult.getOrDefault("missing_skills", Collections.emptyList());

        // --- 2. Per-dimension scores ---
        int skillScore      = calculateSkillScore(userSkills, entity.getSkills(), matchedSkills);
        int locationScore   = calculateLocationScore(user.getLocation(), entity.getLocation());
        int experienceScore = calculateExperienceScore(resumeText, jobDescription);
        int preferenceScore = calculatePreferenceScore(user, entity);

        // --- 3. Weighted overall score (0–100) ---
        // Weights: skills 40%, context match 30%, location 15%, preference 15%
        int overallScore = (int) Math.round(
                skillScore      * 0.35 +
                (rawMatchScore * 100) * 0.30 +
                locationScore   * 0.20 +
                experienceScore * 0.10 +
                preferenceScore * 0.05
        );
        overallScore = Math.min(100, Math.max(0, overallScore));

        Map<String, Integer> breakdown = new LinkedHashMap<>();
        breakdown.put("skills",      skillScore);
        breakdown.put("experience",  experienceScore);
        breakdown.put("location",    locationScore);
        breakdown.put("preferences", preferenceScore);

        // --- 4. Gemini explanation ---
        String explanation = generateExplanation(
                user, entity, overallScore, matchedSkills, missingSkills);

        // --- 5. Build response with NormalizedJob DTO ---
        NormalizedJob jobDto = toDto(entity);

        return new JobRecommendationResponse(jobDto, overallScore, breakdown, explanation);
    }

    // -----------------------------------------------------------------------
    // Dimension scorers
    // -----------------------------------------------------------------------

    /**
     * Skill score: ratio of user skills present in job description / skills list.
     */
    private int calculateSkillScore(List<String> userSkills,
                                     List<String> jobSkills,
                                     List<String> matchedSkills) {
        if (userSkills.isEmpty()) return 50; // neutral if no profile skills

        // Prefer matched_skills from context engine if available
        if (!matchedSkills.isEmpty()) {
            List<String> combined = new ArrayList<>(jobSkills);
            combined.addAll(matchedSkills); // union
            long matches = matchedSkills.size();
            long total   = Math.max(combined.stream().distinct().count(), 1);
            return (int) Math.min(100, (matches * 100) / total);
        }

        // Fallback: keyword search in description
        long found = userSkills.stream()
                .filter(s -> !s.isBlank())
                .filter(s -> jobSkills.stream().anyMatch(js -> js.equalsIgnoreCase(s)))
                .count();
        return (int) Math.min(100, (found * 100) / userSkills.size());
    }

    /**
     * Location score: 100 if remote, 80 if city match, 40 if country match, 20 otherwise.
     */
    private int calculateLocationScore(String userLocation, String jobLocation) {
        if (jobLocation == null) return 50;
        String jl = jobLocation.toLowerCase();
        if (jl.contains("remote")) return 100;
        if (userLocation == null || userLocation.isBlank()) return 50;
        String ul = userLocation.toLowerCase();
        if (jl.equals(ul)) return 100;
        // Partial match (city or country)
        String[] parts = ul.split("[,\\s]+");
        for (String p : parts) {
            if (p.length() > 2 && jl.contains(p)) return 80;
        }
        return 30;
    }

    /**
     * Experience score: heuristic — checks if job description level matches
     * estimated years from resume text.
     */
    private int calculateExperienceScore(String resumeText, String jobDescription) {
        if (resumeText == null || resumeText.isBlank() || jobDescription == null) return 50;
        String jd = jobDescription.toLowerCase();
        String rt = resumeText.toLowerCase();

        // Rough experience extraction — count "X years" patterns in resume
        int userYears = extractYearsOfExperience(rt);
        int requiredYears = extractRequiredYears(jd);

        if (requiredYears == 0) return 75; // job doesn't specify → neutral
        if (userYears == 0) return 50;     // resume unclear → neutral

        if (userYears >= requiredYears) return 100;
        double ratio = (double) userYears / requiredYears;
        return (int) Math.round(ratio * 80); // cap at 80 if under-experienced
    }

    /**
     * Preference score: matches employment type and work mode preferences.
     */
    private int calculatePreferenceScore(UserEntity user, NormalizedJobEntity job) {
        int score = 50; // start neutral

        // Check if job location / description suggests remote — users with
        // accessibility needs often prefer remote
        String jobLocation = job.getLocation() != null ? job.getLocation().toLowerCase() : "";
        String jobDesc = job.getDescription() != null ? job.getDescription().toLowerCase() : "";
        if (jobLocation.contains("remote") || jobDesc.contains("remote") || jobDesc.contains("work from home")) {
            score += 30;
        }

        // Check employment type preference (stored in user headline / summary heuristically)
        String empType = job.getEmploymentType();
        if (empType != null) {
            String userSummary = (user.getSummary() != null ? user.getSummary() : "").toLowerCase();
            if (empType.toLowerCase().contains("full") && userSummary.contains("full-time")) score += 20;
            if (empType.toLowerCase().contains("intern") && userSummary.contains("intern")) score += 20;
        }

        return Math.min(100, score);
    }

    // -----------------------------------------------------------------------
    // Gemini explanation generator
    // -----------------------------------------------------------------------

    private String generateExplanation(UserEntity user,
                                        NormalizedJobEntity job,
                                        int overallScore,
                                        List<String> matchedSkills,
                                        List<String> missingSkills) {
        try {
            String prompt = buildExplanationPrompt(user, job, overallScore, matchedSkills, missingSkills);

            Map<String, Object> part = Map.of("text", prompt);
            Map<String, Object> content = Map.of("parts", List.of(part));
            Map<String, Object> requestBody = Map.of("contents", List.of(content));

            String url = GEMINI_API_BASE + "?key=" + geminiApiKey;

            String response = webClient.post()
                    .uri(url)
                    .body(BodyInserters.fromValue(requestBody))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response == null) return defaultExplanation(overallScore, matchedSkills);

            JsonNode root = objectMapper.readTree(response);
            JsonNode text = root.path("candidates").path(0)
                    .path("content").path("parts").path(0).path("text");
            if (!text.isMissingNode()) {
                return text.asText().trim();
            }

        } catch (Exception e) {
            log.warn("Gemini explanation failed for job '{}': {}", job.getId(), e.getMessage());
        }

        return defaultExplanation(overallScore, matchedSkills);
    }

    private String buildExplanationPrompt(UserEntity user, NormalizedJobEntity job,
                                           int overallScore, List<String> matchedSkills,
                                           List<String> missingSkills) {
        return String.format("""
            You are a helpful job advisor. In 2-3 concise sentences, explain why this job is recommended for this candidate.
            Be specific about which skills match and what the candidate may still need to develop.
            Do NOT use markdown. Write in plain text, first person perspective ("This job is recommended because...").
            
            Candidate name: %s
            Candidate skills: %s
            
            Job title: %s
            Company: %s
            Location: %s
            Employment type: %s
            
            Overall match score: %d/100
            Matched skills: %s
            Missing/gap skills: %s
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
                    "This job was matched with a score of %d/100 based on your profile and resume content.", overallScore);
        }
        return String.format(
                "This job is recommended with a %d%% match because your skills in %s align with the job requirements.",
                overallScore, String.join(", ", matchedSkills.subList(0, Math.min(3, matchedSkills.size()))));
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private String loadResumeText(String userId, UserEntity user) {
        try {
            // getUserResumes returns list sorted by updatedAt desc — take the first active one
            List<com.ai.accessibility.model.Resume> resumes = resumeService.getUserResumes(userId);
            if (!resumes.isEmpty()) {
                com.ai.accessibility.model.Resume resume = resumes.get(0);
                StringBuilder sb = new StringBuilder();

                // personalInfo summary
                if (resume.getPersonalInfo() != null) {
                    Object summary = resume.getPersonalInfo().get("summary");
                    if (summary != null) sb.append(summary).append("\n");
                }

                // skills map — may have keys: technical, soft, languages, etc.
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

                // experience list — serialize to text
                if (resume.getExperience() != null) {
                    for (Map<String, Object> exp : resume.getExperience()) {
                        if (exp.containsKey("position"))    sb.append(exp.get("position")).append(" ");
                        if (exp.containsKey("company"))     sb.append(exp.get("company")).append(" ");
                        if (exp.containsKey("description")) sb.append(exp.get("description")).append(" ");
                    }
                    sb.append("\n");
                }

                // education list
                if (resume.getEducation() != null) {
                    for (Map<String, Object> edu : resume.getEducation()) {
                        if (edu.containsKey("degree"))      sb.append(edu.get("degree")).append(" ");
                        if (edu.containsKey("institution")) sb.append(edu.get("institution")).append(" ");
                    }
                }

                String text = sb.toString().trim();
                if (!text.isEmpty()) return text;
            }
        } catch (Exception e) {
            log.debug("Could not load resume for user '{}': {}", userId, e.getMessage());
        }
        // Fallback: build from user profile fields
        StringBuilder sb = new StringBuilder();
        if (user.getSummary() != null) sb.append(user.getSummary()).append(" ");
        if (user.getSkills() != null)  sb.append(String.join(" ", user.getSkills()));
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
        job.setPostedDate(e.getPostedDate());
        return job;
    }

    private double extractDouble(Map<String, Object> map, String key, double defaultValue) {
        Object val = map.get(key);
        if (val instanceof Number) return ((Number) val).doubleValue();
        return defaultValue;
    }

    /** Extracts the largest "X years" pattern from resume text */
    private int extractYearsOfExperience(String text) {
        Pattern p = Pattern.compile("(\\d+)\\+?\\s*years?");
        Matcher m = p.matcher(text);
        int max = 0;
        while (m.find()) {
            try { max = Math.max(max, Integer.parseInt(m.group(1))); } catch (Exception ignored) {}
        }
        return max;
    }

    /** Extracts the minimum years required from a job description */
    private int extractRequiredYears(String jd) {
        Pattern p = Pattern.compile("(\\d+)\\+?\\s*years?\\s*(of)?\\s*(experience|exp)");
        Matcher m = p.matcher(jd);
        if (m.find()) {
            try { return Integer.parseInt(m.group(1)); } catch (Exception ignored) {}
        }
        // Check for seniority keywords
        if (jd.contains("entry level") || jd.contains("junior") || jd.contains("fresher")) return 0;
        if (jd.contains("senior") || jd.contains("lead")) return 5;
        return 0;
    }
}

package com.ai.accessibility.service;

import com.ai.accessibility.model.NormalizedJob;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

/**
 * Job Normalizer.
 *
 * Responsibilities:
 *  - Converts provider-specific responses and fields into the standard {@link NormalizedJob} model.
 *  - Sanitizes text, normalizes employment types, extracts skills from descriptions if empty.
 *  - Ensures dates and expiration boundaries are valid.
 *  - Delegates normalized jobs to {@link JobDeduplicationService} for deduplication and persistence.
 */
@Service
public class JobNormalizerService {

    private static final Logger log = LoggerFactory.getLogger(JobNormalizerService.class);

    private static final List<String> COMMON_SKILLS = List.of(
            "java", "spring boot", "spring", "python", "javascript", "typescript", "react",
            "node.js", "sql", "postgresql", "mongodb", "docker", "kubernetes", "aws", "azure",
            "git", "rest api", "graphql", "html", "css", "c++", "c#", ".net", "kafka", "redis",
            "machine learning", "data analysis", "accessibility", "wcag", "agile", "scrum"
    );

    private final JobDeduplicationService deduplicationService;

    public JobNormalizerService(JobDeduplicationService deduplicationService) {
        this.deduplicationService = deduplicationService;
    }

    /**
     * Normalizes a batch of raw jobs and forwards them to deduplication & storage.
     *
     * @param rawJobs Raw jobs from providers
     * @return Number of saved/updated unique jobs
     */
    public int normalizeAndPersist(List<NormalizedJob> rawJobs) {
        if (rawJobs == null || rawJobs.isEmpty()) {
            return 0;
        }

        List<NormalizedJob> normalizedList = new ArrayList<>();
        for (NormalizedJob raw : rawJobs) {
            try {
                NormalizedJob normalized = normalizeSingle(raw);
                if (normalized != null) {
                    normalizedList.add(normalized);
                }
            } catch (Exception e) {
                log.debug("Error normalizing job '{}': {}", raw.getTitle(), e.getMessage());
            }
        }

        return deduplicationService.deduplicateAndSave(normalizedList);
    }

    /**
     * Normalizes a single job.
     */
    public NormalizedJob normalizeSingle(NormalizedJob job) {
        if (job == null || job.getTitle() == null || job.getTitle().isBlank()) {
            return null;
        }

        // 1. Sanitize text fields
        job.setTitle(cleanText(job.getTitle()));
        job.setCompany(job.getCompany() != null ? cleanText(job.getCompany()) : "Unknown Company");
        job.setLocation(job.getLocation() != null ? cleanText(job.getLocation()) : "Remote");

        // 2. Standardize employment type
        job.setEmploymentType(standardizeEmploymentType(job.getEmploymentType(), job.getTitle() + " " + (job.getDescription() != null ? job.getDescription() : "")));

        // 3. Extract skills if empty
        if (job.getSkills() == null || job.getSkills().isEmpty()) {
            job.setSkills(extractSkillsFromText(job.getTitle() + " " + (job.getDescription() != null ? job.getDescription() : "")));
        }

        // 4. Ensure timestamps
        Date now = new Date();
        if (job.getFetchedAt() == null) {
            job.setFetchedAt(now);
        }
        if (job.getPostedAt() == null) {
            job.setPostedAt(now);
        }
        if (job.getExpiresAt() == null) {
            Calendar cal = Calendar.getInstance();
            cal.setTime(job.getPostedAt());
            cal.add(Calendar.DAY_OF_MONTH, 30);
            job.setExpiresAt(cal.getTime());
        }

        job.setIsActive(true);
        return job;
    }

    private String cleanText(String text) {
        if (text == null) return null;
        // Strip HTML tags if present (some APIs return HTML snippets)
        String cleaned = text.replaceAll("<[^>]*>", " ");
        cleaned = cleaned.replaceAll("\\s+", " ").trim();
        return cleaned;
    }

    private String standardizeEmploymentType(String rawType, String fallbackText) {
        String s = (rawType != null ? rawType : fallbackText).toLowerCase();
        if (s.contains("contract") || s.contains("contractor") || s.contains("freelance")) return "contract";
        if (s.contains("intern") || s.contains("internship")) return "internship";
        if (s.contains("part-time") || s.contains("part time")) return "part-time";
        return "full-time";
    }

    private List<String> extractSkillsFromText(String text) {
        if (text == null || text.isBlank()) return new ArrayList<>();
        String lower = " " + text.toLowerCase() + " ";
        List<String> found = new ArrayList<>();

        for (String skill : COMMON_SKILLS) {
            String pattern = "(?i)\\b" + Pattern.quote(skill) + "\\b";
            if (Pattern.compile(pattern).matcher(lower).find()) {
                found.add(skill);
            }
        }
        return found;
    }
}

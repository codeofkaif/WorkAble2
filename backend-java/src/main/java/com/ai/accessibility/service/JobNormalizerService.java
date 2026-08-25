package com.ai.accessibility.service;

import com.ai.accessibility.entity.NormalizedJobEntity;
import com.ai.accessibility.model.NormalizedJob;
import com.ai.accessibility.repository.jpa.NormalizedJobJpaRepository;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Job Normalizer — converts incoming {@link NormalizedJob} DTOs into
 * {@link NormalizedJobEntity} entities, applies three-layer deduplication,
 * and persists unique jobs to PostgreSQL.
 *
 * Deduplication order:
 *  1. Exact sourceJobId + source match    → skip
 *  2. Exact applyUrl match                → skip
 *  3. Normalised company + title + location match → skip
 */
@Service
public class JobNormalizerService {

    private static final Logger log = LoggerFactory.getLogger(JobNormalizerService.class);

    private final NormalizedJobJpaRepository repo;

    public JobNormalizerService(NormalizedJobJpaRepository repo) {
        this.repo = repo;
    }

    /**
     * Deduplicates the incoming list against the database and saves new jobs.
     *
     * @param jobs Raw jobs from all providers
     * @return Number of jobs actually saved
     */
    public int deduplicateAndSave(List<NormalizedJob> jobs) {
        int saved = 0;

        for (NormalizedJob job : jobs) {
            try {
                if (isDuplicate(job)) {
                    log.debug("Skipping duplicate job: '{}' @ '{}' [{}]",
                            job.getTitle(), job.getCompany(), job.getSource());
                    continue;
                }

                NormalizedJobEntity entity = toEntity(job);
                repo.save(entity);
                saved++;

            } catch (Exception e) {
                log.warn("Failed to save job '{}' from '{}': {}",
                        job.getTitle(), job.getSource(), e.getMessage());
            }
        }

        log.info("Deduplication complete: {} unique jobs saved out of {} total", saved, jobs.size());
        return saved;
    }

    // -----------------------------------------------------------------------
    // Deduplication
    // -----------------------------------------------------------------------

    private boolean isDuplicate(NormalizedJob job) {
        // Layer 1: exact provider ID match
        if (job.getSourceJobId() != null && job.getSource() != null) {
            if (repo.existsBySourceJobIdAndSource(job.getSourceJobId(), job.getSource())) {
                return true;
            }
        }

        // Layer 2: exact apply URL match
        if (job.getApplyUrl() != null && !job.getApplyUrl().isBlank()) {
            if (repo.existsByApplyUrl(normalizeUrl(job.getApplyUrl()))) {
                return true;
            }
        }

        // Layer 3: fuzzy company + title + location
        String company  = normalizeText(job.getCompany());
        String title    = normalizeText(job.getTitle());
        String location = normalizeText(job.getLocation());

        if (company != null && title != null && location != null) {
            return repo.findByCompanyAndTitleAndLocation(company, title, location).isPresent();
        }

        return false;
    }

    // -----------------------------------------------------------------------
    // DTO → Entity mapping
    // -----------------------------------------------------------------------

    private NormalizedJobEntity toEntity(NormalizedJob job) {
        NormalizedJobEntity e = new NormalizedJobEntity();

        e.setTitle(job.getTitle() != null ? job.getTitle() : "Untitled");
        e.setCompany(job.getCompany() != null ? job.getCompany() : "Unknown");
        e.setLocation(job.getLocation());
        e.setDescription(job.getDescription());
        e.setSkills(job.getSkills() != null ? job.getSkills() : new ArrayList<>());
        e.setSalary(job.getSalary());
        e.setEmploymentType(job.getEmploymentType());
        e.setSource(job.getSource());
        e.setSourceJobId(job.getSourceJobId());
        e.setApplyUrl(job.getApplyUrl() != null ? normalizeUrl(job.getApplyUrl()) : null);
        e.setPostedDate(job.getPostedDate());

        return e;
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /** Remove query-string tracking params for cleaner URL dedup */
    private String normalizeUrl(String url) {
        if (url == null) return null;
        int q = url.indexOf('?');
        return (q > 0 ? url.substring(0, q) : url).trim().toLowerCase();
    }

    /** Lowercase + collapse whitespace for fuzzy dedup */
    private String normalizeText(String text) {
        if (text == null || text.isBlank()) return null;
        return text.trim().toLowerCase().replaceAll("\\s+", " ");
    }
}

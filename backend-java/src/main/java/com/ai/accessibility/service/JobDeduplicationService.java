package com.ai.accessibility.service;

import com.ai.accessibility.entity.NormalizedJobEntity;
import com.ai.accessibility.model.NormalizedJob;
import com.ai.accessibility.repository.jpa.NormalizedJobJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Job Deduplicator & Persistence Service.
 *
 * Responsibilities:
 *  - Detects duplicate jobs before saving to PostgreSQL.
 *  - Checks:
 *      1. (source, sourceJobId)
 *      2. applyUrl (with tracking params stripped)
 *      3. normalized company + title + location
 *  - Updates existing jobs (refreshes fetchedAt, updatedAt, expiresAt, isActive=true)
 *    rather than creating duplicates.
 *  - Manages job expiration lifecycle by deactivating expired jobs.
 */
@Service
public class JobDeduplicationService {

    private static final Logger log = LoggerFactory.getLogger(JobDeduplicationService.class);

    private final NormalizedJobJpaRepository repo;

    public JobDeduplicationService(NormalizedJobJpaRepository repo) {
        this.repo = repo;
    }

    /**
     * Deduplicates and saves or updates the given normalized jobs in PostgreSQL.
     *
     * @param normalizedJobs List of normalized jobs to process
     * @return Number of jobs saved (new or updated)
     */
    @Transactional
    public int deduplicateAndSave(List<NormalizedJob> normalizedJobs) {
        if (normalizedJobs == null || normalizedJobs.isEmpty()) {
            return 0;
        }

        int inserted = 0;
        int updated = 0;
        Date now = new Date();

        for (NormalizedJob job : normalizedJobs) {
            try {
                if (job.getTitle() == null || job.getTitle().isBlank()) {
                    continue;
                }

                Optional<NormalizedJobEntity> existingOpt = findExistingDuplicate(job);

                if (existingOpt.isPresent()) {
                    // Update existing record with fresh timestamps & latest data
                    NormalizedJobEntity existing = existingOpt.get();
                    updateExistingJob(existing, job, now);
                    repo.save(existing);
                    updated++;
                } else {
                    // Insert new job record
                    NormalizedJobEntity entity = toNewEntity(job, now);
                    repo.save(entity);
                    inserted++;
                }

            } catch (Exception e) {
                log.warn("Failed to persist job '{}' from '{}': {}",
                        job.getTitle(), job.getSource(), e.getMessage());
            }
        }

        log.info("Deduplication & persistence complete: {} inserted, {} updated, {} total processed",
                inserted, updated, normalizedJobs.size());
        return inserted + updated;
    }

    /**
     * Deactivates all jobs whose expiration date has passed.
     *
     * @return Number of jobs marked inactive
     */
    @Transactional
    public int markExpiredJobsInactive() {
        Date now = new Date();
        int deactivated = repo.deactivateExpiredJobs(now);
        if (deactivated > 0) {
            log.info("Job lifecycle cleanup: deactivated {} expired jobs", deactivated);
        }
        return deactivated;
    }

    // -----------------------------------------------------------------------
    // Duplicate Detection Logic
    // -----------------------------------------------------------------------

    private Optional<NormalizedJobEntity> findExistingDuplicate(NormalizedJob job) {
        // 1. Exact match by provider source & sourceJobId
        if (job.getSourceJobId() != null && !job.getSourceJobId().isBlank()
                && job.getSource() != null && !job.getSource().isBlank()) {
            Optional<NormalizedJobEntity> bySourceId = repo.findBySourceJobIdAndSource(
                    job.getSourceJobId().trim(), job.getSource().trim());
            if (bySourceId.isPresent()) return bySourceId;
        }

        // 2. Exact match by apply URL (normalized)
        if (job.getApplyUrl() != null && !job.getApplyUrl().isBlank()) {
            String normUrl = normalizeUrl(job.getApplyUrl());
            Optional<NormalizedJobEntity> byUrl = repo.findByApplyUrl(normUrl);
            if (byUrl.isPresent()) return byUrl;
        }

        // 3. Normalized Company + Title + Location match
        String normCompany  = normalizeText(job.getCompany());
        String normTitle    = normalizeText(job.getTitle());
        String normLocation = normalizeText(job.getLocation());

        if (normCompany != null && normTitle != null && normLocation != null) {
            return repo.findByCompanyAndTitleAndLocation(normCompany, normTitle, normLocation);
        }

        return Optional.empty();
    }

    // -----------------------------------------------------------------------
    // Entity Mapping & Updates
    // -----------------------------------------------------------------------

    private void updateExistingJob(NormalizedJobEntity target, NormalizedJob incoming, Date now) {
        target.setFetchedAt(now);
        target.setUpdatedAt(now);
        target.setIsActive(true);

        if (incoming.getDescription() != null && incoming.getDescription().length() > (target.getDescription() != null ? target.getDescription().length() : 0)) {
            target.setDescription(incoming.getDescription());
        }
        if (incoming.getSalary() != null && !incoming.getSalary().isBlank()) {
            target.setSalary(incoming.getSalary());
        }
        if (incoming.getSkills() != null && !incoming.getSkills().isEmpty()) {
            Set<String> mergedSkills = new LinkedHashSet<>(target.getSkills());
            mergedSkills.addAll(incoming.getSkills());
            target.setSkills(new ArrayList<>(mergedSkills));
        }
        if (incoming.getExpiresAt() != null) {
            target.setExpiresAt(incoming.getExpiresAt());
        }
    }

    private NormalizedJobEntity toNewEntity(NormalizedJob job, Date now) {
        NormalizedJobEntity e = new NormalizedJobEntity();

        e.setTitle(job.getTitle() != null ? job.getTitle().trim() : "Untitled");
        e.setCompany(job.getCompany() != null ? job.getCompany().trim() : "Unknown");
        e.setLocation(job.getLocation() != null ? job.getLocation().trim() : "Remote");
        e.setDescription(job.getDescription());
        e.setSkills(job.getSkills() != null ? job.getSkills() : new ArrayList<>());
        e.setSalary(job.getSalary());
        e.setEmploymentType(job.getEmploymentType() != null ? job.getEmploymentType() : "full-time");
        e.setSource(job.getSource() != null ? job.getSource() : "external");
        e.setSourceJobId(job.getSourceJobId());
        e.setApplyUrl(normalizeUrl(job.getApplyUrl()));
        e.setPostedAt(job.getPostedAt() != null ? job.getPostedAt() : now);
        e.setFetchedAt(now);
        e.setExpiresAt(job.getExpiresAt());
        e.setIsActive(true);
        e.setCreatedAt(now);
        e.setUpdatedAt(now);

        return e;
    }

    private String normalizeUrl(String url) {
        if (url == null || url.isBlank()) return null;
        int q = url.indexOf('?');
        return (q > 0 ? url.substring(0, q) : url).trim().toLowerCase();
    }

    private String normalizeText(String text) {
        if (text == null || text.isBlank()) return null;
        return text.trim().toLowerCase().replaceAll("\\s+", " ");
    }
}

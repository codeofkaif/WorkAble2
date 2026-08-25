package com.ai.accessibility.service;

import com.ai.accessibility.model.NormalizedJob;
import com.ai.accessibility.provider.JobProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Job Aggregator — fans out to all registered {@link JobProvider} beans,
 * collects their results, then hands them off to {@link JobNormalizerService}
 * for deduplication and persistence.
 *
 * The aggregator does NOT know how any individual provider works internally.
 */
@Service
public class JobAggregatorService {

    private static final Logger log = LoggerFactory.getLogger(JobAggregatorService.class);

    /** Spring injects ALL JobProvider beans (Jooble, Adzuna, JSearch) automatically */
    private final List<JobProvider> providers;
    private final JobNormalizerService normalizerService;

    public JobAggregatorService(List<JobProvider> providers,
                                 JobNormalizerService normalizerService) {
        this.providers = providers;
        this.normalizerService = normalizerService;
    }

    /**
     * Fetch jobs from all providers for the given keyword + location,
     * deduplicate them, and persist them to PostgreSQL.
     *
     * @param keyword  Job search keyword (e.g. "Java developer")
     * @param location Preferred location (e.g. "remote", "New York")
     * @return Number of new (non-duplicate) jobs saved to the database
     */
    public int fetchAndStore(String keyword, String location) {
        log.info("Starting job aggregation: keyword='{}', location='{}'", keyword, location);

        List<NormalizedJob> allJobs = new ArrayList<>();

        for (JobProvider provider : providers) {
            log.info("Fetching from provider: {}", provider.getSourceName());
            try {
                // Fetch page 1 from each provider (sufficient for a college project)
                List<NormalizedJob> jobs = provider.fetchJobs(keyword, location, 1);
                log.info("Provider '{}' returned {} jobs", provider.getSourceName(), jobs.size());
                allJobs.addAll(jobs);
            } catch (Exception e) {
                // One failing provider must not stop the others
                log.error("Provider '{}' threw an unexpected exception: {}",
                        provider.getSourceName(), e.getMessage());
            }
        }

        log.info("Total raw jobs collected from all providers: {}", allJobs.size());
        int saved = normalizerService.deduplicateAndSave(allJobs);
        log.info("Job aggregation complete. New jobs saved: {}", saved);
        return saved;
    }
}

package com.ai.accessibility.service;

import com.ai.accessibility.model.NormalizedJob;
import com.ai.accessibility.provider.JobProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Job Aggregator.
 *
 * Responsibilities:
 *  - Orchestrates calls to all registered {@link JobProvider} implementations (Jooble, Adzuna, JSearch).
 *  - Handles API failures, timeouts, missing keys, and rate limits gracefully.
 *  - Combines results across all providers.
 *  - Forwards the collected raw jobs to {@link JobNormalizerService}.
 *  - Never exposes provider-specific data formats to the rest of the application.
 */
@Service
public class JobAggregatorService {

    private static final Logger log = LoggerFactory.getLogger(JobAggregatorService.class);

    private final List<JobProvider> providers;
    private final JobNormalizerService normalizerService;

    public JobAggregatorService(List<JobProvider> providers,
                                JobNormalizerService normalizerService) {
        this.providers = providers != null ? providers : List.of();
        this.normalizerService = normalizerService;
    }

    /**
     * Ingests jobs from all available external providers for the specified keyword & location,
     * normalizes them, deduplicates against PostgreSQL, and saves unique records.
     *
     * @param keyword  Job title / keyword
     * @param location Desired location / remote
     * @return Number of jobs saved (inserted + updated)
     */
    public int fetchAndStore(String keyword, String location) {
        log.info("Job Aggregator: Starting external job ingestion (keyword='{}', location='{}')", keyword, location);

        List<NormalizedJob> combinedRawJobs = new ArrayList<>();
        int successfulProviders = 0;

        for (JobProvider provider : providers) {
            String sourceName = provider.getSourceName();
            try {
                log.info("Job Aggregator: Querying provider '{}'", sourceName);
                List<NormalizedJob> jobs = provider.fetchJobs(keyword, location, 1);

                if (jobs != null && !jobs.isEmpty()) {
                    combinedRawJobs.addAll(jobs);
                    successfulProviders++;
                    log.info("Job Aggregator: Provider '{}' returned {} jobs", sourceName, jobs.size());
                } else {
                    log.debug("Job Aggregator: Provider '{}' returned 0 jobs", sourceName);
                }
            } catch (Exception e) {
                // One provider's failure must never crash the aggregation pipeline
                log.error("Job Aggregator: Provider '{}' failed: {}", sourceName, e.getMessage());
            }
        }

        log.info("Job Aggregator: Ingestion summary — {} raw jobs collected from {}/{} active providers",
                combinedRawJobs.size(), successfulProviders, providers.size());

        if (combinedRawJobs.isEmpty()) {
            log.warn("Job Aggregator: No jobs were returned by any external provider");
            return 0;
        }

        // Delegate to Normalizer & Deduplicator
        int saved = normalizerService.normalizeAndPersist(combinedRawJobs);
        log.info("Job Aggregator: Normalized and persisted {} jobs in PostgreSQL", saved);
        return saved;
    }

    /**
     * Fetches default sets of jobs for background synchronization across common technology categories.
     */
    public int fetchDefaultJobSync() {
        List<String> keywords = List.of(
                "software engineer",
                "java developer",
                "full stack developer",
                "python developer",
                "accessibility specialist"
        );

        int totalSaved = 0;
        for (String kw : keywords) {
            totalSaved += fetchAndStore(kw, "remote");
        }
        return totalSaved;
    }
}

package com.ai.accessibility.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Background Job Synchronization Scheduler.
 *
 * Periodically ingests fresh jobs from available external providers,
 * updates PostgreSQL, and marks expired jobs as inactive.
 * Configured via:
 *  - app.jobs.sync-interval-ms (default 21600000 ms = 6 hours)
 *  - app.jobs.sync-enabled (default true)
 */
@Component
public class JobSyncScheduler {

    private static final Logger log = LoggerFactory.getLogger(JobSyncScheduler.class);

    private final JobAggregatorService aggregatorService;
    private final JobDeduplicationService deduplicationService;

    @Value("${app.jobs.sync-enabled:true}")
    private boolean syncEnabled;

    public JobSyncScheduler(JobAggregatorService aggregatorService,
                            JobDeduplicationService deduplicationService) {
        this.aggregatorService = aggregatorService;
        this.deduplicationService = deduplicationService;
    }

    /**
     * Periodic background sync.
     * Default: every 6 hours (21,600,000 ms), with an initial delay of 1 minute after startup.
     */
    @Scheduled(
        fixedDelayString = "${app.jobs.sync-interval-ms:21600000}",
        initialDelayString = "${app.jobs.sync-initial-delay-ms:60000}"
    )
    public void runPeriodicJobSync() {
        if (!syncEnabled) {
            log.info("Background Job Sync: Disabled by configuration");
            return;
        }

        log.info("Background Job Sync: Starting scheduled synchronization cycle...");

        try {
            // 1. Mark expired jobs inactive
            int expiredCount = deduplicationService.markExpiredJobsInactive();
            log.info("Background Job Sync: Deactivated {} expired jobs", expiredCount);

            // 2. Ingest fresh jobs across default categories
            int ingestedCount = aggregatorService.fetchDefaultJobSync();
            log.info("Background Job Sync: Completed successfully — {} new/updated jobs stored in PostgreSQL", ingestedCount);

        } catch (Exception e) {
            log.error("Background Job Sync: Error during scheduled cycle: {}", e.getMessage(), e);
        }
    }
}

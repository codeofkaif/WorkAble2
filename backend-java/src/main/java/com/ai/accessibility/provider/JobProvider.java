package com.ai.accessibility.provider;

import com.ai.accessibility.model.NormalizedJob;
import java.util.List;

/**
 * Common interface for all external job API providers.
 *
 * Each provider is completely independent — it knows only about its own API
 * and converts results into the common {@link NormalizedJob} model.
 * The recommendation engine never interacts with a provider directly.
 */
public interface JobProvider {

    /**
     * Human-readable name for this source (used as the "source" field in NormalizedJob).
     * Examples: "jooble", "adzuna", "jsearch"
     */
    String getSourceName();

    /**
     * Fetch a page of jobs from the provider.
     *
     * @param keyword  Job title / keyword to search for
     * @param location Preferred location (may be empty / "remote")
     * @param page     1-based page number
     * @return List of normalized jobs (empty list on error — never throws)
     */
    List<NormalizedJob> fetchJobs(String keyword, String location, int page);
}

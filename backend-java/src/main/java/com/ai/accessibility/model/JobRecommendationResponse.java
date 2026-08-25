package com.ai.accessibility.model;

import java.util.Map;

/**
 * Final API response for the recommendation endpoint.
 * Contains the normalized job, overall match score,
 * a per-dimension breakdown, and an AI-generated explanation.
 */
public class JobRecommendationResponse {

    private NormalizedJob job;

    /** Overall match score 0–100 */
    private int matchScore;

    /** Per-dimension breakdown: skills, experience, location, preferences */
    private Map<String, Integer> scoreBreakdown;

    /** Human-readable AI explanation of why this job was recommended */
    private String explanation;

    /** Direct link to apply */
    private String applyUrl;

    // ---- Constructors ----

    public JobRecommendationResponse() {}

    public JobRecommendationResponse(NormalizedJob job, int matchScore,
                                     Map<String, Integer> scoreBreakdown,
                                     String explanation) {
        this.job = job;
        this.matchScore = matchScore;
        this.scoreBreakdown = scoreBreakdown;
        this.explanation = explanation;
        this.applyUrl = job != null ? job.getApplyUrl() : null;
    }

    // ---- Getters & Setters ----

    public NormalizedJob getJob() { return job; }
    public void setJob(NormalizedJob job) {
        this.job = job;
        this.applyUrl = job != null ? job.getApplyUrl() : null;
    }

    public int getMatchScore() { return matchScore; }
    public void setMatchScore(int matchScore) { this.matchScore = matchScore; }

    public Map<String, Integer> getScoreBreakdown() { return scoreBreakdown; }
    public void setScoreBreakdown(Map<String, Integer> scoreBreakdown) { this.scoreBreakdown = scoreBreakdown; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getApplyUrl() { return applyUrl; }
    public void setApplyUrl(String applyUrl) { this.applyUrl = applyUrl; }
}

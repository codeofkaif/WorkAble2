package com.ai.accessibility.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

/**
 * Recommendation API Response DTO.
 *
 * Provides a clean, normalized structure containing:
 *  - jobId
 *  - title
 *  - company
 *  - location
 *  - source
 *  - matchScore (0–100)
 *  - explanation (AI generated)
 *  - applyUrl
 *  - scoreBreakdown (skills, experience, location, preferences)
 *  - skills, salary, employmentType
 */
public class JobRecommendationResponse {

    @JsonProperty("jobId")
    private String jobId;

    private String title;
    private String company;
    private String location;
    private String source;

    @JsonProperty("matchScore")
    private int matchScore;

    private String explanation;
    private String applyUrl;
    private String salary;
    private String employmentType;
    private List<String> skills;

    /** Breakdown: skills, experience, location, preferences */
    private Map<String, Integer> scoreBreakdown;

    /** Full normalized job DTO */
    private NormalizedJob job;

    // ---- Constructors ----

    public JobRecommendationResponse() {}

    public JobRecommendationResponse(NormalizedJob job, int matchScore,
                                     Map<String, Integer> scoreBreakdown,
                                     String explanation) {
        this.job = job;
        if (job != null) {
            this.jobId = job.getId();
            this.title = job.getTitle();
            this.company = job.getCompany();
            this.location = job.getLocation();
            this.source = job.getSource();
            this.applyUrl = job.getApplyUrl();
            this.salary = job.getSalary();
            this.employmentType = job.getEmploymentType();
            this.skills = job.getSkills();
        }
        this.matchScore = matchScore;
        this.scoreBreakdown = scoreBreakdown;
        this.explanation = explanation;
    }

    // ---- Getters & Setters ----

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public int getMatchScore() { return matchScore; }
    public void setMatchScore(int matchScore) { this.matchScore = matchScore; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getApplyUrl() { return applyUrl; }
    public void setApplyUrl(String applyUrl) { this.applyUrl = applyUrl; }

    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }

    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public Map<String, Integer> getScoreBreakdown() { return scoreBreakdown; }
    public void setScoreBreakdown(Map<String, Integer> scoreBreakdown) { this.scoreBreakdown = scoreBreakdown; }

    public NormalizedJob getJob() { return job; }
    public void setJob(NormalizedJob job) {
        this.job = job;
        if (job != null) {
            if (this.jobId == null) this.jobId = job.getId();
            if (this.title == null) this.title = job.getTitle();
            if (this.company == null) this.company = job.getCompany();
            if (this.location == null) this.location = job.getLocation();
            if (this.source == null) this.source = job.getSource();
            if (this.applyUrl == null) this.applyUrl = job.getApplyUrl();
            if (this.salary == null) this.salary = job.getSalary();
            if (this.employmentType == null) this.employmentType = job.getEmploymentType();
            if (this.skills == null) this.skills = job.getSkills();
        }
    }
}

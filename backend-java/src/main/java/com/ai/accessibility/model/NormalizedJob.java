package com.ai.accessibility.model;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Common normalized job DTO — source-agnostic.
 * All job providers (Jooble, Adzuna, JSearch) normalize their responses into this model.
 * The rest of the application (deduplicator, database, AI recommendation engine) only interacts with this model.
 */
public class NormalizedJob {

    private String id;
    private String title;
    private String company;
    private String location;
    private String description;
    private List<String> skills = new ArrayList<>();
    private String salary;
    private String employmentType; // "full-time" | "part-time" | "contract" | "internship"
    private String source;         // "jooble" | "adzuna" | "jsearch"
    private String sourceJobId;    // original provider job id
    private String applyUrl;
    private Date postedAt;
    private Date fetchedAt;
    private Date expiresAt;
    private boolean isActive = true;
    private Date createdAt;
    private Date updatedAt;

    // ---- Constructors ----

    public NormalizedJob() {
        this.fetchedAt = new Date();
        this.isActive = true;
    }

    public NormalizedJob(String title, String company, String location,
                         String description, String source, String sourceJobId,
                         String applyUrl) {
        this();
        this.title = title;
        this.company = company;
        this.location = location;
        this.description = description;
        this.source = source;
        this.sourceJobId = sourceJobId;
        this.applyUrl = applyUrl;
    }

    // ---- Getters & Setters ----

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills != null ? skills : new ArrayList<>(); }

    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }

    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getSourceJobId() { return sourceJobId; }
    public void setSourceJobId(String sourceJobId) { this.sourceJobId = sourceJobId; }

    public String getApplyUrl() { return applyUrl; }
    public void setApplyUrl(String applyUrl) { this.applyUrl = applyUrl; }

    public Date getPostedAt() { return postedAt; }
    public void setPostedAt(Date postedAt) { this.postedAt = postedAt; }

    public Date getFetchedAt() { return fetchedAt; }
    public void setFetchedAt(Date fetchedAt) { this.fetchedAt = fetchedAt; }

    public Date getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Date expiresAt) { this.expiresAt = expiresAt; }

    public boolean isActive() { return isActive; }
    public void setIsActive(boolean active) { isActive = active; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}

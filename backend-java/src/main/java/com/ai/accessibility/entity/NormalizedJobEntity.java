package com.ai.accessibility.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * JPA entity for normalized jobs in PostgreSQL.
 * Serves as the primary job store for recommendation queries and background synchronizations.
 */
@Entity
@Table(
    name = "normalized_jobs",
    indexes = {
        @Index(name = "idx_nj_source_job_id", columnList = "source, source_job_id", unique = true),
        @Index(name = "idx_nj_apply_url",     columnList = "apply_url"),
        @Index(name = "idx_nj_source",        columnList = "source"),
        @Index(name = "idx_nj_active_fetched", columnList = "is_active, fetched_at"),
        @Index(name = "idx_nj_active_posted",  columnList = "is_active, posted_at")
    }
)
public class NormalizedJobEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "company", nullable = false)
    private String company;

    @Column(name = "location")
    private String location;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /** Extracted or normalized skill keywords */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "normalized_job_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    private List<String> skills = new ArrayList<>();

    @Column(name = "salary")
    private String salary;

    /** e.g. full-time | part-time | contract | internship */
    @Column(name = "employment_type")
    private String employmentType;

    /** API source name: "jooble" | "adzuna" | "jsearch" */
    @Column(name = "source", nullable = false, length = 32)
    private String source;

    /** Original job ID from the provider */
    @Column(name = "source_job_id", length = 256)
    private String sourceJobId;

    /** Direct application link */
    @Column(name = "apply_url", length = 1024)
    private String applyUrl;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "posted_at")
    private Date postedAt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "fetched_at")
    private Date fetchedAt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "expires_at")
    private Date expiresAt;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at")
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "updated_at")
    private Date updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null || id.isEmpty()) {
            id = UUID.randomUUID().toString();
        }
        Date now = new Date();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (fetchedAt == null) fetchedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
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

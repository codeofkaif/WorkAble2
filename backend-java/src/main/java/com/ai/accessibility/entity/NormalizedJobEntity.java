package com.ai.accessibility.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * JPA entity for normalized jobs fetched from external APIs.
 * Stored in the "normalized_jobs" table — completely separate from
 * the employer-posted "jobs" table (JobEntity).
 */
@Entity
@Table(
    name = "normalized_jobs",
    indexes = {
        @Index(name = "idx_nj_source_job_id", columnList = "source, source_job_id", unique = true),
        @Index(name = "idx_nj_apply_url",     columnList = "apply_url"),
        @Index(name = "idx_nj_source",        columnList = "source")
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

    /** Extracted or inferred skill keywords */
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

    @Column(name = "posted_date")
    private LocalDate postedDate;

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
        createdAt = new Date();
        updatedAt = new Date();
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

    public LocalDate getPostedDate() { return postedDate; }
    public void setPostedDate(LocalDate postedDate) { this.postedDate = postedDate; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}

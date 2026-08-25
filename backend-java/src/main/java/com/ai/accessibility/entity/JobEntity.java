package com.ai.accessibility.entity;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "jobs")
public class JobEntity {
    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "company", nullable = false)
    private String company;

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "work_mode") // "remote" | "hybrid" | "on-site"
    private String workMode = "remote";

    @Column(name = "type") // "full-time" | "part-time" | "contract" | "internship"
    private String type = "full-time";

    @Column(name = "experience_level") // "entry" | "mid" | "senior" | "lead"
    private String experienceLevel = "entry";

    @Column(name = "salary")
    private String salary;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "requirements", columnDefinition = "TEXT")
    private String requirements;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    private List<String> skillsRequired;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_accessibility_support", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "support_feature")
    private List<String> accessibilitySupport;

    @Column(name = "posted_by", nullable = false)
    private String postedBy; // Foreign Key to UserEntity.id

    @Column(name = "status", nullable = false) // "active" | "closed"
    private String status = "active";

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "application_deadline")
    private Date applicationDeadline;

    @Column(name = "max_applications")
    private Integer maxApplications;

    @Column(name = "application_count")
    private Integer applicationCount = 0;

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
        if (applicationCount == null) {
            applicationCount = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }

    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRequirements() { return requirements; }
    public void setRequirements(String requirements) { this.requirements = requirements; }

    public List<String> getSkillsRequired() { return skillsRequired; }
    public void setSkillsRequired(List<String> skillsRequired) { this.skillsRequired = skillsRequired; }

    public List<String> getAccessibilitySupport() { return accessibilitySupport; }
    public void setAccessibilitySupport(List<String> accessibilitySupport) { this.accessibilitySupport = accessibilitySupport; }

    public String getPostedBy() { return postedBy; }
    public void setPostedBy(String postedBy) { this.postedBy = postedBy; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isActive() { return isActive; }
    public void setIsActive(boolean active) { this.isActive = active; }

    public Date getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(Date applicationDeadline) { this.applicationDeadline = applicationDeadline; }

    public Integer getMaxApplications() { return maxApplications; }
    public void setMaxApplications(Integer maxApplications) { this.maxApplications = maxApplications; }

    public Integer getApplicationCount() { return applicationCount; }
    public void setApplicationCount(Integer applicationCount) { this.applicationCount = applicationCount; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}

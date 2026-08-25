package com.ai.accessibility.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Common normalized job DTO — source-agnostic.
 * All three job providers (Jooble, Adzuna, JSearch) convert their
 * raw API responses into this model before any further processing.
 */
public class NormalizedJob {

    private String id;
    private String title;
    private String company;
    private String location;
    private String description;
    private List<String> skills = new ArrayList<>();
    private String salary;
    private String employmentType;  // full-time | part-time | contract | internship
    private String source;          // "jooble" | "adzuna" | "jsearch"
    private String sourceJobId;     // original ID from the provider
    private String applyUrl;
    private LocalDate postedDate;

    // ---- Constructors ----

    public NormalizedJob() {}

    public NormalizedJob(String title, String company, String location,
                         String description, String source, String sourceJobId,
                         String applyUrl) {
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

    public LocalDate getPostedDate() { return postedDate; }
    public void setPostedDate(LocalDate postedDate) { this.postedDate = postedDate; }
}

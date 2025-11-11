package com.ai.accessibility.resume;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Document("resumes")
public class Resume {
    @Id
    private String id;
    private String userId;
    private Map<String, Object> personalInfo;
    private List<Map<String, Object>> experience;
    private List<Map<String, Object>> education;
    private Map<String, Object> skills;
    private List<Map<String, Object>> projects;
    private List<Map<String, Object>> certifications;
    private Map<String, Object> accessibility;
    private String template;
    private boolean aiGenerated;
    private String aiPrompt;
    private boolean isActive = true;
    private Date createdAt;
    private Date updatedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public Map<String, Object> getPersonalInfo() { return personalInfo; }
    public void setPersonalInfo(Map<String, Object> personalInfo) { this.personalInfo = personalInfo; }
    public List<Map<String, Object>> getExperience() { return experience; }
    public void setExperience(List<Map<String, Object>> experience) { this.experience = experience; }
    public List<Map<String, Object>> getEducation() { return education; }
    public void setEducation(List<Map<String, Object>> education) { this.education = education; }
    public Map<String, Object> getSkills() { return skills; }
    public void setSkills(Map<String, Object> skills) { this.skills = skills; }
    public List<Map<String, Object>> getProjects() { return projects; }
    public void setProjects(List<Map<String, Object>> projects) { this.projects = projects; }
    public List<Map<String, Object>> getCertifications() { return certifications; }
    public void setCertifications(List<Map<String, Object>> certifications) { this.certifications = certifications; }
    public Map<String, Object> getAccessibility() { return accessibility; }
    public void setAccessibility(Map<String, Object> accessibility) { this.accessibility = accessibility; }
    public String getTemplate() { return template; }
    public void setTemplate(String template) { this.template = template; }
    public boolean isAiGenerated() { return aiGenerated; }
    public void setAiGenerated(boolean aiGenerated) { this.aiGenerated = aiGenerated; }
    public String getAiPrompt() { return aiPrompt; }
    public void setAiPrompt(String aiPrompt) { this.aiPrompt = aiPrompt; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}



package com.ai.accessibility.service;

import com.ai.accessibility.model.Resume;
import com.ai.accessibility.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Resume Service - Matches Node.js resume routes behavior exactly
 */
@Service
public class ResumeService {
    
    @Autowired
    private ResumeRepository resumeRepository;
    
    /**
     * Create resume - Matches POST /api/resume exactly
     */
    @SuppressWarnings("unchecked")
    public Resume createResume(Map<String, Object> resumeData, String userId) {
        Resume resume = new Resume();
        
        // Map all fields from request
        if (resumeData.containsKey("personalInfo")) {
            resume.setPersonalInfo((Map<String, Object>) resumeData.get("personalInfo"));
        }
        if (resumeData.containsKey("experience")) {
            resume.setExperience((List<Map<String, Object>>) resumeData.get("experience"));
        }
        if (resumeData.containsKey("education")) {
            resume.setEducation((List<Map<String, Object>>) resumeData.get("education"));
        }
        if (resumeData.containsKey("skills")) {
            resume.setSkills((Map<String, Object>) resumeData.get("skills"));
        }
        if (resumeData.containsKey("projects")) {
            resume.setProjects((List<Map<String, Object>>) resumeData.get("projects"));
        }
        if (resumeData.containsKey("certifications")) {
            resume.setCertifications((List<Map<String, Object>>) resumeData.get("certifications"));
        }
        if (resumeData.containsKey("accessibility")) {
            resume.setAccessibility((Map<String, Object>) resumeData.get("accessibility"));
        }
        if (resumeData.containsKey("template")) {
            resume.setTemplate((String) resumeData.get("template"));
        }
        if (resumeData.containsKey("aiGenerated")) {
            resume.setAiGenerated((Boolean) resumeData.get("aiGenerated"));
        }
        if (resumeData.containsKey("aiPrompt")) {
            resume.setAiPrompt((String) resumeData.get("aiPrompt"));
        }
        
        resume.setUserId(userId);
        resume.setIsActive(true);
        resume.setCreatedAt(new Date());
        resume.setUpdatedAt(new Date());
        
        return resumeRepository.save(resume);
    }
    
    /**
     * Get all resumes for user - Matches GET /api/resume exactly
     */
    public List<Resume> getUserResumes(String userId) {
        return resumeRepository.findByUserIdAndIsActiveOrderByUpdatedAtDesc(userId, true);
    }
    
    /**
     * Get resume by ID - Matches GET /api/resume/:id exactly
     */
    public Resume getResumeById(String id, String userId) {
        Optional<Resume> resumeOpt = resumeRepository.findById(id);
        if (resumeOpt.isEmpty()) {
            throw new IllegalArgumentException("Resume not found");
        }
        
        Resume resume = resumeOpt.get();
        if (!resume.getUserId().equals(userId) || !resume.isActive()) {
            throw new IllegalArgumentException("Resume not found");
        }
        
        return resume;
    }
    
    /**
     * Update resume - Matches PUT /api/resume/:id exactly
     */
    @SuppressWarnings("unchecked")
    public Resume updateResume(String id, Map<String, Object> resumeData, String userId) {
        Resume resume = getResumeById(id, userId);
        
        // Update fields
        if (resumeData.containsKey("personalInfo")) {
            resume.setPersonalInfo((Map<String, Object>) resumeData.get("personalInfo"));
        }
        if (resumeData.containsKey("experience")) {
            resume.setExperience((List<Map<String, Object>>) resumeData.get("experience"));
        }
        if (resumeData.containsKey("education")) {
            resume.setEducation((List<Map<String, Object>>) resumeData.get("education"));
        }
        if (resumeData.containsKey("skills")) {
            resume.setSkills((Map<String, Object>) resumeData.get("skills"));
        }
        if (resumeData.containsKey("projects")) {
            resume.setProjects((List<Map<String, Object>>) resumeData.get("projects"));
        }
        if (resumeData.containsKey("certifications")) {
            resume.setCertifications((List<Map<String, Object>>) resumeData.get("certifications"));
        }
        if (resumeData.containsKey("accessibility")) {
            resume.setAccessibility((Map<String, Object>) resumeData.get("accessibility"));
        }
        if (resumeData.containsKey("template")) {
            resume.setTemplate((String) resumeData.get("template"));
        }
        
        resume.setUpdatedAt(new Date());
        
        return resumeRepository.save(resume);
    }
    
    /**
     * Delete resume - Matches DELETE /api/resume/:id exactly
     */
    public void deleteResume(String id, String userId) {
        Resume resume = getResumeById(id, userId);
        resume.setIsActive(false);
        resume.setUpdatedAt(new Date());
        resumeRepository.save(resume);
    }
}

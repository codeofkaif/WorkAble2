package com.ai.accessibility.controller;

import com.ai.accessibility.model.Resume;
import com.ai.accessibility.service.AIResumeService;
import com.ai.accessibility.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Resume Controller - Matches Node.js /api/resume routes exactly
 */
@RestController
@RequestMapping("/api/resume")
public class ResumeController {
    
    @Autowired
    private ResumeService resumeService;
    
    @Autowired
    private AIResumeService aiResumeService;
    
    @Value("${app.env:development}")
    private String environment;
    
    /**
     * POST /api/resume
     * Create new resume - Matches Node.js endpoint exactly
     */
    @PostMapping
    public ResponseEntity<?> createResume(
            @RequestBody Map<String, Object> resumeData,
            Authentication authentication) {
        try {
            String userId = (String) authentication.getPrincipal();
            Resume resume = resumeService.createResume(resumeData, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", resume);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "status", "error",
                "message", e.getMessage() != null ? e.getMessage() : "Failed to create resume"
            ));
        }
    }
    
    /**
     * GET /api/resume
     * Get all resumes for user - Matches Node.js endpoint exactly
     */
    @GetMapping
    public ResponseEntity<?> getResumes(Authentication authentication) {
        try {
            String userId = (String) authentication.getPrincipal();
            List<Resume> resumes = resumeService.getUserResumes(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", resumes);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", e.getMessage() != null ? e.getMessage() : "Failed to fetch resumes"
            ));
        }
    }
    
    /**
     * POST /api/resume/generate
     * AI-powered resume generation - Matches Node.js endpoint exactly
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generateResume(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String userId = (String) authentication.getPrincipal();
            String prompt = (String) request.get("prompt");
            String template = (String) request.getOrDefault("template", "modern");
            
            if (prompt == null || prompt.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "error",
                    "message", "Prompt is required for AI generation"
                ));
            }
            
            // Generate resume using AI
            Map<String, Object> aiGeneratedData = aiResumeService.generateResume(prompt, template);
            
            // Create resume with AI-generated data
            Map<String, Object> resumeData = new HashMap<>(aiGeneratedData);
            resumeData.put("template", template);
            resumeData.put("aiGenerated", true);
            resumeData.put("aiPrompt", prompt);
            
            Resume resume = resumeService.createResume(resumeData, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", resume);
            response.put("message", "AI-generated resume created successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Failed to generate AI resume",
                "error", "development".equals(environment) ? e.getMessage() : "Internal server error"
            ));
        }
    }
    
    /**
     * GET /api/resume/:id
     * Get specific resume - Matches Node.js endpoint exactly
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getResume(
            @PathVariable String id,
            Authentication authentication) {
        try {
            String userId = (String) authentication.getPrincipal();
            Resume resume = resumeService.getResumeById(id, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", resume);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", e.getMessage() != null ? e.getMessage() : "Failed to fetch resume"
            ));
        }
    }
    
    /**
     * PUT /api/resume/:id
     * Update resume - Matches Node.js endpoint exactly
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateResume(
            @PathVariable String id,
            @RequestBody Map<String, Object> resumeData,
            Authentication authentication) {
        try {
            String userId = (String) authentication.getPrincipal();
            Resume resume = resumeService.updateResume(id, resumeData, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", resume);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "status", "error",
                "message", e.getMessage() != null ? e.getMessage() : "Failed to update resume"
            ));
        }
    }
    
    /**
     * DELETE /api/resume/:id
     * Delete resume - Matches Node.js endpoint exactly
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResume(
            @PathVariable String id,
            Authentication authentication) {
        try {
            String userId = (String) authentication.getPrincipal();
            resumeService.deleteResume(id, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Resume deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", e.getMessage() != null ? e.getMessage() : "Failed to delete resume"
            ));
        }
    }
    
    /**
     * POST /api/resume/upload
     * Upload and extract resume file - Matches Node.js endpoint exactly
     * Note: File upload handling simplified for now
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(@RequestParam("resume") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "error",
                    "message", "No file uploaded"
                ));
            }
            
            // For now, return basic structure
            // Full file parsing can be added later with Apache POI, PDFBox, etc.
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Resume uploaded successfully");
            
            Map<String, Object> data = new HashMap<>();
            Map<String, Object> personalInfo = new HashMap<>();
            personalInfo.put("fullName", "");
            personalInfo.put("email", "");
            personalInfo.put("phone", "");
            personalInfo.put("summary", "File uploaded: " + file.getOriginalFilename());
            data.put("personalInfo", personalInfo);
            data.put("experience", List.of());
            data.put("education", List.of());
            Map<String, Object> skills = new HashMap<>();
            skills.put("technical", List.of());
            skills.put("soft", List.of());
            data.put("skills", skills);
            data.put("projects", List.of());
            
            response.put("data", data);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Failed to extract resume data",
                "error", "development".equals(environment) ? e.getMessage() : "Internal server error"
            ));
        }
    }
}

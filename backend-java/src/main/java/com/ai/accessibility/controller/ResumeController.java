package com.ai.accessibility.controller;

import com.ai.accessibility.model.Resume;
import com.ai.accessibility.service.AIResumeService;
import com.ai.accessibility.service.ContextEngineClient;
import com.ai.accessibility.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/resume")
@CrossOrigin(origins = "*")
public class ResumeController {
    
    @Autowired
    private ResumeService resumeService;
    
    @Autowired
    private AIResumeService aiResumeService;

    @Autowired
    private ContextEngineClient contextEngineClient;
    
    @Value("${app.env:development}")
    private String environment;
    
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
            
            Map<String, Object> generatedData = aiResumeService.generateResume(prompt, template);
            
            Map<String, Object> resumeToSave = new HashMap<>(generatedData);
            resumeToSave.put("template", template);
            resumeToSave.put("aiGenerated", true);
            resumeToSave.put("aiPrompt", prompt);
            
            Resume savedResume = resumeService.createResume(resumeToSave, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", savedResume);
            response.put("message", "Resume generated successfully with AI");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Failed to generate resume with AI",
                "error", "development".equals(environment) ? e.getMessage() : "Internal server error"
            ));
        }
    }
    
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
    
    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam(value = "resume", required = false) MultipartFile resumeFile,
            @RequestParam(value = "file", required = false) MultipartFile genericFile
    ) {
        try {
            MultipartFile file = resumeFile != null ? resumeFile : genericFile;
            if (file == null || file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "error",
                    "message", "No file uploaded"
                ));
            }
            
            // Delegate parsing to Context Engine / ML microservice
            Map<String, Object> parsed = contextEngineClient.parseResume(file.getBytes(), file.getOriginalFilename());
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Resume parsed successfully");

            Map<String, Object> data = new HashMap<>();
            Map<String, Object> personalInfo = new HashMap<>();
            personalInfo.put("fullName", parsed.getOrDefault("name", ""));
            personalInfo.put("email", parsed.getOrDefault("email", ""));
            personalInfo.put("phone", parsed.getOrDefault("phone", ""));
            personalInfo.put("address", parsed.getOrDefault("address", ""));
            personalInfo.put("summary", parsed.getOrDefault("summary", ""));
            personalInfo.put("linkedin", parsed.getOrDefault("linkedin_url", ""));
            personalInfo.put("website", parsed.getOrDefault("github_url", ""));
            data.put("personalInfo", personalInfo);

            // Format Experience entries to match frontend schema { company, position, startDate, endDate, description }
            List<Map<String, Object>> rawExp = (List<Map<String, Object>>) parsed.getOrDefault("experience", List.of());
            List<Map<String, Object>> formattedExp = new ArrayList<>();
            for (Map<String, Object> exp : rawExp) {
                Map<String, Object> entry = new HashMap<>();
                entry.put("company", exp.getOrDefault("company", ""));
                String pos = (String) exp.getOrDefault("position", exp.getOrDefault("title", ""));
                entry.put("position", pos != null ? pos : "");
                entry.put("startDate", exp.getOrDefault("start_date", ""));
                entry.put("endDate", exp.getOrDefault("end_date", ""));
                entry.put("description", exp.getOrDefault("description", ""));
                formattedExp.add(entry);
            }
            data.put("experience", formattedExp);

            // Format Education entries to match frontend schema { institution, degree, field, startDate, endDate, gpa }
            List<Map<String, Object>> rawEdu = (List<Map<String, Object>>) parsed.getOrDefault("education", List.of());
            List<Map<String, Object>> formattedEdu = new ArrayList<>();
            for (Map<String, Object> edu : rawEdu) {
                Map<String, Object> entry = new HashMap<>();
                entry.put("institution", edu.getOrDefault("institution", ""));
                entry.put("degree", edu.getOrDefault("degree", ""));
                entry.put("field", edu.getOrDefault("field", ""));
                entry.put("startDate", edu.getOrDefault("start_date", edu.getOrDefault("year", "")));
                entry.put("endDate", edu.getOrDefault("end_date", edu.getOrDefault("year", "")));
                entry.put("gpa", edu.getOrDefault("cgpa_or_percentage", ""));
                formattedEdu.add(entry);
            }
            data.put("education", formattedEdu);

            data.put("skills", Map.of("technical", parsed.getOrDefault("skills", List.of()), "soft", List.of()));
            data.put("projects", parsed.getOrDefault("projects", List.of()));
            data.put("certifications", parsed.getOrDefault("certifications", List.of()));
            data.put("totalExperienceYears", parsed.getOrDefault("total_experience_years", 0.0));
            data.put("confidenceScore", parsed.getOrDefault("confidence_score", 1.0));
            data.put("parsingSource", parsed.getOrDefault("parsing_source", "local"));

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

    @PostMapping("/ats-score")
    public ResponseEntity<?> getATSScore(@RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> parsedResume = (Map<String, Object>) payload.get("parsed_resume");
            String rawText = (String) payload.get("raw_text");
            String jobDesc = (String) payload.get("job_description");

            Map<String, Object> result = contextEngineClient.calculateATSScore(parsedResume, rawText, jobDesc);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Failed to calculate ATS score: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/match-job")
    public ResponseEntity<?> matchJob(@RequestBody Map<String, Object> payload) {
        try {
            List<String> skills = (List<String>) payload.get("resume_skills");
            String resumeText = (String) payload.get("resume_text");
            String jobDesc = (String) payload.get("job_description");
            boolean useEmbeddings = Boolean.TRUE.equals(payload.get("use_embeddings"));

            Map<String, Object> result = contextEngineClient.matchJob(skills, resumeText, jobDesc, useEmbeddings);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Failed to match job: " + e.getMessage()
            ));
        }
    }
}

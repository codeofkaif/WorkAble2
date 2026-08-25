package com.ai.accessibility.controller;

import com.ai.accessibility.entity.ApplicationEntity;
import com.ai.accessibility.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> applyToJob(
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        if (authentication == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "error");
            err.put("message", "Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        String userId = (String) authentication.getPrincipal();
        String jobId = (String) body.get("jobId");
        String resumeId = (String) body.get("resumeId");
        String coverLetter = (String) body.get("coverLetter");

        ApplicationEntity app = applicationService.applyToJob(userId, jobId, resumeId, coverLetter);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", app);
        response.put("message", "Applied successfully");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-applications")
    public ResponseEntity<Map<String, Object>> getMyApplications(Authentication authentication) {
        if (authentication == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "error");
            err.put("message", "Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        String userId = (String) authentication.getPrincipal();
        List<Map<String, Object>> apps = applicationService.getUserApplications(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", apps);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<Map<String, Object>> getJobApplicants(
            @PathVariable String jobId,
            Authentication authentication
    ) {
        if (authentication == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "error");
            err.put("message", "Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        String employerId = (String) authentication.getPrincipal();
        List<Map<String, Object>> applicants = applicationService.getJobApplicants(employerId, jobId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", applicants);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        if (authentication == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "error");
            err.put("message", "Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        String employerId = (String) authentication.getPrincipal();
        String status = (String) body.get("status");

        ApplicationEntity updated = applicationService.updateApplicationStatus(employerId, id, status);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", updated);
        return ResponseEntity.ok(response);
    }
}

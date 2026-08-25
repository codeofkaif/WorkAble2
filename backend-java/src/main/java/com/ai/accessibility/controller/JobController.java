package com.ai.accessibility.controller;

import com.ai.accessibility.entity.JobEntity;
import com.ai.accessibility.model.JobRecommendationResponse;
import com.ai.accessibility.service.JobAggregatorService;
import com.ai.accessibility.service.JobRecommendationService;
import com.ai.accessibility.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    @Autowired
    private JobService jobService;

    @Autowired
    private JobAggregatorService jobAggregatorService;

    @Autowired
    private JobRecommendationService jobRecommendationService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createJob(
            @RequestBody Map<String, Object> jobData,
            Authentication authentication
    ) {
        if (authentication == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "error");
            err.put("message", "Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        String employerId = (String) authentication.getPrincipal();
        JobEntity job = jobService.createJob(employerId, jobData);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", job);
        response.put("message", "Job posted successfully");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getJobs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String workMode,
            @RequestParam(required = false) String location
    ) {
        List<JobEntity> jobs = jobService.getAllJobs(search, type, workMode, location);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", jobs);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getJobById(@PathVariable String id) {
        return jobService.getJobById(id)
                .map(job -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("status", "success");
                    response.put("data", job);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> err = new HashMap<>();
                    err.put("status", "error");
                    err.put("message", "Job not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
                });
    }

    @GetMapping("/employer/my-jobs")
    public ResponseEntity<Map<String, Object>> getMyJobs(Authentication authentication) {
        if (authentication == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "error");
            err.put("message", "Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        String employerId = (String) authentication.getPrincipal();
        List<JobEntity> jobs = jobService.getEmployerJobs(employerId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", jobs);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateJob(
            @PathVariable String id,
            @RequestBody Map<String, Object> updates,
            Authentication authentication
    ) {
        if (authentication == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "error");
            err.put("message", "Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        String employerId = (String) authentication.getPrincipal();
        JobEntity updated = jobService.updateJob(id, employerId, updates);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", updated);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteJob(
            @PathVariable String id,
            Authentication authentication
    ) {
        if (authentication == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "error");
            err.put("message", "Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        String employerId = (String) authentication.getPrincipal();
        jobService.deleteJob(id, employerId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Job deleted successfully");
        return ResponseEntity.ok(response);
    }

    // =========================================================================
    // External Job Aggregation Endpoints
    // =========================================================================

    /**
     * POST /api/jobs/external/fetch?keyword=java&location=remote
     *
     * Triggers a fetch from all configured job providers (Jooble, Adzuna, JSearch),
     * deduplicates results, and persists new jobs to PostgreSQL.
     * Authentication required so only authorized users can trigger ingestion.
     */
    @PostMapping("/external/fetch")
    public ResponseEntity<Map<String, Object>> fetchExternalJobs(
            @RequestParam(defaultValue = "software engineer") String keyword,
            @RequestParam(defaultValue = "") String location,
            Authentication authentication
    ) {
        if (authentication == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "error");
            err.put("message", "Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        try {
            int saved = jobAggregatorService.fetchAndStore(keyword, location);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", saved + " new jobs fetched and saved from external providers");
            response.put("newJobsSaved", saved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "error");
            err.put("message", "Failed to fetch external jobs: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    /**
     * GET /api/jobs/external/recommendations
     *
     * Returns AI-scored job recommendations for the authenticated user.
     * Each result contains: job + matchScore + scoreBreakdown + explanation + applyUrl
     */
    @GetMapping("/external/recommendations")
    public ResponseEntity<Map<String, Object>> getRecommendations(
            Authentication authentication
    ) {
        if (authentication == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "error");
            err.put("message", "Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        try {
            String userId = (String) authentication.getPrincipal();
            List<JobRecommendationResponse> recommendations = jobRecommendationService.recommend(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", recommendations);
            response.put("count", recommendations.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "error");
            err.put("message", "Failed to generate recommendations: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }
}

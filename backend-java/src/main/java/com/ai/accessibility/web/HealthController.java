package com.ai.accessibility.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Health Check Controller - Matches Node.js /api/health endpoint
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Value("${app.env:development}")
    private String environment;

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "success",
            "message", "AI Job Accessibility API is running",
                "timestamp", Instant.now().toString(),
                "environment", environment
        ));
    }
}

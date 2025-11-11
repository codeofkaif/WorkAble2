package com.ai.accessibility.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @Value("${app.env:development}")
    private String environment;

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "success",
                "message", "AI Job Accessibility API is running (Java)",
                "timestamp", Instant.now().toString(),
                "environment", environment
        );
    }
}



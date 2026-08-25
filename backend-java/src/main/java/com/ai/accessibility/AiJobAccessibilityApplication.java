package com.ai.accessibility;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Spring Boot Application
 * Matches Node.js backend functionality exactly
 */
@SpringBootApplication
@EnableMongoAuditing
@EnableScheduling
public class AiJobAccessibilityApplication {
    public static void main(String[] args) {
        SpringApplication.run(AiJobAccessibilityApplication.class, args);
    }
}



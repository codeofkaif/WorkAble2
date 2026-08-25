package com.ai.accessibility.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/skills")
@CrossOrigin(origins = "*")
public class SkillsController {

    private static final List<Map<String, String>> SAMPLE_JOBS = List.of(
            Map.of("uuid", "job-1", "title", "Full Stack Java Developer", "normalized_job_title", "full stack java developer"),
            Map.of("uuid", "job-2", "title", "Frontend React Engineer", "normalized_job_title", "frontend react engineer"),
            Map.of("uuid", "job-3", "title", "Python AI/ML Engineer", "normalized_job_title", "python ai ml engineer"),
            Map.of("uuid", "job-4", "title", "DevOps & Cloud Specialist", "normalized_job_title", "devops cloud specialist"),
            Map.of("uuid", "job-5", "title", "Accessibility QA Engineer", "normalized_job_title", "accessibility qa engineer")
    );

    private static final List<Map<String, String>> SAMPLE_SKILLS = List.of(
            Map.of("uuid", "sk-1", "name", "Java", "skill_name", "Java"),
            Map.of("uuid", "sk-2", "name", "Spring Boot", "skill_name", "Spring Boot"),
            Map.of("uuid", "sk-3", "name", "React", "skill_name", "React"),
            Map.of("uuid", "sk-4", "name", "TypeScript", "skill_name", "TypeScript"),
            Map.of("uuid", "sk-5", "name", "PostgreSQL", "skill_name", "PostgreSQL"),
            Map.of("uuid", "sk-6", "name", "MongoDB", "skill_name", "MongoDB"),
            Map.of("uuid", "sk-7", "name", "Python", "skill_name", "Python"),
            Map.of("uuid", "sk-8", "name", "Docker", "skill_name", "Docker"),
            Map.of("uuid", "sk-9", "name", "Web Accessibility (WCAG)", "skill_name", "Web Accessibility (WCAG)")
    );

    @GetMapping("/jobs/autocomplete")
    public ResponseEntity<List<Map<String, String>>> autocompleteJobs(@RequestParam(defaultValue = "") String contains) {
        String query = contains.toLowerCase();
        List<Map<String, String>> filtered = SAMPLE_JOBS.stream()
                .filter(j -> j.get("title").toLowerCase().contains(query))
                .toList();
        return ResponseEntity.ok(filtered);
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<List<Map<String, String>>> autocompleteSkills(@RequestParam(defaultValue = "") String contains) {
        String query = contains.toLowerCase();
        List<Map<String, String>> filtered = SAMPLE_SKILLS.stream()
                .filter(s -> s.get("name").toLowerCase().contains(query))
                .toList();
        return ResponseEntity.ok(filtered);
    }
}

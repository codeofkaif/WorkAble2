package com.ai.accessibility.resume;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    // Make repository optional for now to allow app to boot without Mongo
    private final ResumeRepository repository;

    public ResumeController(@org.springframework.lang.Nullable ResumeRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Resume resume) {
        if (repository == null) {
            return ResponseEntity.status(503).body(Map.of("status", "error", "message", "MongoDB not configured"));
        }
        resume.setActive(true);
        Resume saved = repository.save(resume);
        return ResponseEntity.status(201).body(Map.of("status", "success", "data", saved));
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestParam String userId) {
        if (repository == null) {
            return ResponseEntity.ok(Map.of("status", "success", "data", List.of()));
        }
        List<Resume> items = repository.findByUserIdAndIsActiveOrderByUpdatedAtDesc(userId, true);
        return ResponseEntity.ok(Map.of("status", "success", "data", items));
    }
}



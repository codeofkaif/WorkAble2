package com.ai.accessibility.skills;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SkillsProxyController {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public SkillsProxyController(
            RestTemplateBuilder builder,
            @Value("${skills.api.base-url:https://api.dataatwork.org/v1}") String baseUrl,
            @Value("${skills.api.timeout-ms:10000}") long timeoutMs
    ) {
        this.restTemplate = builder
                .defaultHeader("User-Agent", "ai-job-accessibility/1.0 (+https://localhost)")
                .setConnectTimeout(Duration.ofMillis(timeoutMs))
                .setReadTimeout(Duration.ofMillis(timeoutMs))
                .build();
        this.baseUrl = baseUrl;
    }

    private ResponseEntity<?> forward(String path, Map<String, String> query) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        if (query != null) {
            query.forEach(params::add);
        }
        var uri = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .path(path)
                .queryParams(params)
                .build(true)
                .toUri();
        try {
            Object body = restTemplate.getForObject(uri, Object.class);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "data", body
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(502).body(Map.of(
                    "status", "error",
                    "message", ex.getMessage()
            ));
        }
    }

    @GetMapping("/skills/autocomplete")
    public ResponseEntity<?> skillsAutocomplete(@RequestParam Map<String, String> query) {
        return forward("/skills/autocomplete", query);
    }

    @GetMapping("/jobs/autocomplete")
    public ResponseEntity<?> jobsAutocomplete(@RequestParam Map<String, String> query) {
        return forward("/jobs/autocomplete", query);
    }

    @GetMapping("/skills")
    public ResponseEntity<?> skills(@RequestParam Map<String, String> query) {
        return forward("/skills", query);
    }

    @GetMapping("/jobs")
    public ResponseEntity<?> jobs(@RequestParam Map<String, String> query) {
        return forward("/jobs", query);
    }

    @GetMapping("/skills/{uuid}")
    public ResponseEntity<?> skillById(@PathVariable String uuid, @RequestParam Map<String, String> query) {
        return forward("/skills/" + uuid, query);
    }

    @GetMapping("/jobs/{uuid}")
    public ResponseEntity<?> jobById(@PathVariable String uuid, @RequestParam Map<String, String> query) {
        return forward("/jobs/" + uuid, query);
    }
}



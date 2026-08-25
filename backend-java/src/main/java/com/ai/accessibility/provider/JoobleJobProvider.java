package com.ai.accessibility.provider;

import com.ai.accessibility.model.NormalizedJob;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Jooble job provider.
 * API docs: https://jooble.org/api/about
 * Auth: POST https://jooble.org/api/<API_KEY>  with JSON body { keywords, location, page }
 */
@Component
public class JoobleJobProvider implements JobProvider {

    private static final Logger log = LoggerFactory.getLogger(JoobleJobProvider.class);
    private static final String BASE_URL = "https://jooble.org/api/";
    private static final String SOURCE = "jooble";

    @Value("${app.jobs.jooble.api-key:}")
    private String apiKey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public JoobleJobProvider(WebClient.Builder builder, ObjectMapper objectMapper) {
        this.webClient = builder.build();
        this.objectMapper = objectMapper;
    }

    @Override
    public String getSourceName() {
        return SOURCE;
    }

    @Override
    public List<NormalizedJob> fetchJobs(String keyword, String location, int page) {
        List<NormalizedJob> results = new ArrayList<>();

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Jooble API key not configured — skipping Jooble fetch");
            return results;
        }

        try {
            Map<String, Object> body = new HashMap<>();
            body.put("keywords", keyword != null ? keyword : "");
            body.put("location", location != null ? location : "");
            body.put("page", page);

            String url = BASE_URL + apiKey;

            String response = webClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response == null || response.isBlank()) return results;

            JsonNode root = objectMapper.readTree(response);
            JsonNode jobs = root.path("jobs");

            if (jobs.isArray()) {
                for (JsonNode item : jobs) {
                    try {
                        results.add(toNormalized(item));
                    } catch (Exception e) {
                        log.debug("Jooble: failed to parse job item — {}", e.getMessage());
                    }
                }
            }

        } catch (Exception e) {
            log.warn("Jooble fetch failed (page={}, keyword={}): {}", page, keyword, e.getMessage());
        }

        log.info("Jooble: fetched {} jobs for keyword='{}', location='{}'", results.size(), keyword, location);
        return results;
    }

    // -----------------------------------------------------------------------
    // Mapping: Jooble response → NormalizedJob
    // -----------------------------------------------------------------------

    private NormalizedJob toNormalized(JsonNode item) {
        NormalizedJob job = new NormalizedJob();

        job.setSource(SOURCE);
        job.setSourceJobId(text(item, "id"));
        job.setTitle(text(item, "title"));
        job.setCompany(text(item, "company"));
        job.setLocation(text(item, "location"));
        job.setDescription(text(item, "snippet")); // Jooble returns "snippet" as description
        job.setApplyUrl(text(item, "link"));
        job.setSalary(text(item, "salary"));
        job.setEmploymentType(text(item, "type"));

        // Jooble does not expose a structured skills list — leave empty; Normalizer extracts them
        job.setSkills(new ArrayList<>());

        // Parse date if present (format: "2024-01-15T00:00:00")
        String updated = text(item, "updated");
        if (updated != null && updated.length() >= 10) {
            try {
                job.setPostedDate(LocalDate.parse(updated.substring(0, 10)));
            } catch (Exception ignored) {}
        }

        return job;
    }

    private String text(JsonNode node, String field) {
        JsonNode v = node.get(field);
        if (v == null || v.isNull()) return null;
        String s = v.asText("").trim();
        return s.isEmpty() ? null : s;
    }
}

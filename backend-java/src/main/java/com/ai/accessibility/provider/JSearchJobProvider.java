package com.ai.accessibility.provider;

import com.ai.accessibility.model.NormalizedJob;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * JSearch job provider (via RapidAPI).
 * API docs: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
 * Auth: X-RapidAPI-Key header.
 * Endpoint: GET https://jsearch.p.rapidapi.com/search
 */
@Component
public class JSearchJobProvider implements JobProvider {

    private static final Logger log = LoggerFactory.getLogger(JSearchJobProvider.class);
    private static final String BASE_URL = "https://jsearch.p.rapidapi.com/search";
    private static final String SOURCE = "jsearch";

    @Value("${app.jobs.jsearch.api-key:}")
    private String apiKey;

    @Value("${app.jobs.jsearch.host:jsearch.p.rapidapi.com}")
    private String apiHost;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public JSearchJobProvider(WebClient.Builder builder, ObjectMapper objectMapper) {
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
            log.warn("JSearch API key not configured — skipping JSearch fetch");
            return results;
        }

        try {
            String query = (keyword != null ? keyword : "software engineer")
                    + (location != null && !location.isBlank() ? " in " + location : "");

            String url = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                    .queryParam("query", query)
                    .queryParam("page", page)
                    .queryParam("num_pages", 1)
                    .toUriString();

            String response = webClient.get()
                    .uri(url)
                    .header("X-RapidAPI-Key", apiKey)
                    .header("X-RapidAPI-Host", apiHost)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response == null || response.isBlank()) return results;

            JsonNode root = objectMapper.readTree(response);
            JsonNode jobs = root.path("data");

            if (jobs.isArray()) {
                for (JsonNode item : jobs) {
                    try {
                        results.add(toNormalized(item));
                    } catch (Exception e) {
                        log.debug("JSearch: failed to parse job item — {}", e.getMessage());
                    }
                }
            }

        } catch (Exception e) {
            log.warn("JSearch fetch failed (page={}, keyword={}): {}", page, keyword, e.getMessage());
        }

        log.info("JSearch: fetched {} jobs for keyword='{}', location='{}'", results.size(), keyword, location);
        return results;
    }

    // -----------------------------------------------------------------------
    // Mapping: JSearch response → NormalizedJob
    // -----------------------------------------------------------------------

    private NormalizedJob toNormalized(JsonNode item) {
        NormalizedJob job = new NormalizedJob();

        job.setSource(SOURCE);
        job.setSourceJobId(text(item, "job_id"));
        job.setTitle(text(item, "job_title"));
        job.setCompany(text(item, "employer_name"));

        // Build location string from city + state + country
        String city    = text(item, "job_city");
        String state   = text(item, "job_state");
        String country = text(item, "job_country");
        job.setLocation(joinLocation(city, state, country));

        job.setDescription(text(item, "job_description"));
        job.setApplyUrl(text(item, "job_apply_link"));

        // JSearch provides structured employment type
        job.setEmploymentType(text(item, "job_employment_type")); // FULLTIME | PARTTIME | CONTRACTOR

        // Salary
        String salMin = text(item, "job_min_salary");
        String salMax = text(item, "job_max_salary");
        String salPeriod = text(item, "job_salary_period");
        if (salMin != null || salMax != null) {
            job.setSalary(salMin + " – " + salMax + (salPeriod != null ? " (" + salPeriod + ")" : ""));
        }

        // JSearch provides a highlights.Qualifications array — map to skills
        JsonNode highlights = item.path("job_highlights");
        JsonNode quals = highlights.path("Qualifications");
        List<String> skills = new ArrayList<>();
        if (quals.isArray()) {
            for (JsonNode q : quals) {
                String s = q.asText("").trim();
                if (!s.isEmpty()) skills.add(s);
            }
        }
        job.setSkills(skills);

        // Posted date (epoch seconds)
        JsonNode postedTs = item.get("job_posted_at_timestamp");
        if (postedTs != null && !postedTs.isNull()) {
            try {
                long epochSeconds = postedTs.asLong();
                job.setPostedDate(LocalDate.ofEpochDay(epochSeconds / 86400));
            } catch (Exception ignored) {}
        }

        return job;
    }

    private String joinLocation(String city, String state, String country) {
        List<String> parts = new ArrayList<>();
        if (city != null)    parts.add(city);
        if (state != null)   parts.add(state);
        if (country != null) parts.add(country);
        return parts.isEmpty() ? null : String.join(", ", parts);
    }

    private String text(JsonNode node, String field) {
        JsonNode v = node.get(field);
        if (v == null || v.isNull()) return null;
        String s = v.asText("").trim();
        return s.isEmpty() ? null : s;
    }
}

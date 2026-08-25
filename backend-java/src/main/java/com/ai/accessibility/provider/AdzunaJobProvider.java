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
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Adzuna job provider.
 * API docs: https://developer.adzuna.com/docs/search
 * Auth: app_id + app_key as query params.
 * Endpoint: GET https://api.adzuna.com/v1/api/jobs/{country}/search/{page}
 */
@Component
public class AdzunaJobProvider implements JobProvider {

    private static final Logger log = LoggerFactory.getLogger(AdzunaJobProvider.class);
    private static final String BASE_URL = "https://api.adzuna.com/v1/api/jobs";
    private static final String SOURCE = "adzuna";

    @Value("${app.jobs.adzuna.app-id:}")
    private String appId;

    @Value("${app.jobs.adzuna.api-key:}")
    private String apiKey;

    @Value("${app.jobs.adzuna.country:gb}")
    private String country; // "us", "gb", "in", etc.

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public AdzunaJobProvider(WebClient.Builder builder, ObjectMapper objectMapper) {
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

        if (appId == null || appId.isBlank() || apiKey == null || apiKey.isBlank()) {
            log.warn("Adzuna app_id / api_key not configured — skipping Adzuna fetch");
            return results;
        }

        try {
            UriComponentsBuilder uriBuilder = UriComponentsBuilder
                    .fromHttpUrl(BASE_URL + "/" + country + "/search/" + page)
                    .queryParam("app_id", appId)
                    .queryParam("app_key", apiKey)
                    .queryParam("results_per_page", 20)
                    .queryParam("content-type", "application/json");

            if (keyword != null && !keyword.isBlank()) {
                uriBuilder.queryParam("what", keyword);
            }
            if (location != null && !location.isBlank()) {
                uriBuilder.queryParam("where", location);
            }

            String url = uriBuilder.toUriString();

            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response == null || response.isBlank()) return results;

            JsonNode root = objectMapper.readTree(response);
            JsonNode jobs = root.path("results");

            if (jobs.isArray()) {
                for (JsonNode item : jobs) {
                    try {
                        results.add(toNormalized(item));
                    } catch (Exception e) {
                        log.debug("Adzuna: failed to parse job item — {}", e.getMessage());
                    }
                }
            }

        } catch (Exception e) {
            log.warn("Adzuna fetch failed (page={}, keyword={}): {}", page, keyword, e.getMessage());
        }

        log.info("Adzuna: fetched {} jobs for keyword='{}', location='{}'", results.size(), keyword, location);
        return results;
    }

    // -----------------------------------------------------------------------
    // Mapping: Adzuna response → NormalizedJob
    // -----------------------------------------------------------------------

    private NormalizedJob toNormalized(JsonNode item) {
        NormalizedJob job = new NormalizedJob();

        job.setSource(SOURCE);
        job.setSourceJobId(text(item, "id"));
        job.setTitle(text(item, "title"));

        // Adzuna nests company under "company.display_name"
        JsonNode companyNode = item.path("company");
        job.setCompany(text(companyNode, "display_name"));

        // Adzuna nests location under "location.display_name"
        JsonNode locationNode = item.path("location");
        job.setLocation(text(locationNode, "display_name"));

        job.setDescription(text(item, "description"));
        job.setApplyUrl(text(item, "redirect_url"));

        // Salary range
        String salaryMin = text(item, "salary_min");
        String salaryMax = text(item, "salary_max");
        if (salaryMin != null || salaryMax != null) {
            job.setSalary(salaryMin + " – " + salaryMax);
        }

        job.setEmploymentType(text(item, "contract_type")); // "permanent" | "contract"

        // Adzuna does not return structured skills
        job.setSkills(new ArrayList<>());

        // Parse created date
        String created = text(item, "created");
        if (created != null && created.length() >= 10) {
            try {
                // Adzuna uses ISO 8601: "2024-01-15T09:00:00Z"
                job.setPostedDate(LocalDate.parse(created.substring(0, 10)));
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

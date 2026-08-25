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

import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

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
    private static final Duration TIMEOUT = Duration.ofSeconds(8);

    @Value("${app.jobs.adzuna.app-id:}")
    private String appId;

    @Value("${app.jobs.adzuna.api-key:}")
    private String apiKey;

    @Value("${app.jobs.adzuna.country:us}")
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

        if (appId == null || appId.trim().isEmpty() || apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("Adzuna app_id / api_key not configured — skipping Adzuna fetch");
            return results;
        }

        try {
            UriComponentsBuilder uriBuilder = UriComponentsBuilder
                    .fromHttpUrl(BASE_URL + "/" + country.trim().toLowerCase() + "/search/" + page)
                    .queryParam("app_id", appId.trim())
                    .queryParam("app_key", apiKey.trim())
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
                    .timeout(TIMEOUT)
                    .block();

            if (response == null || response.isBlank()) return results;

            JsonNode root = objectMapper.readTree(response);
            JsonNode jobs = root.path("results");

            if (jobs.isArray()) {
                for (JsonNode item : jobs) {
                    try {
                        NormalizedJob job = toNormalized(item);
                        if (job != null && job.getTitle() != null) {
                            results.add(job);
                        }
                    } catch (Exception e) {
                        log.debug("Adzuna: failed to parse job item — {}", e.getMessage());
                    }
                }
            }

        } catch (Exception e) {
            log.warn("Adzuna fetch failed (page={}, keyword={}): {}", page, keyword, e.getMessage());
        }

        log.info("Adzuna: successfully fetched {} jobs for keyword='{}', location='{}'", results.size(), keyword, location);
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
            job.setSalary((salaryMin != null ? salaryMin : "") + " – " + (salaryMax != null ? salaryMax : ""));
        }

        job.setEmploymentType(text(item, "contract_type")); // "permanent" | "contract"
        job.setFetchedAt(new Date());
        job.setIsActive(true);

        // Parse created date
        String created = text(item, "created");
        Date postedDate = null;
        if (created != null && created.length() >= 10) {
            try {
                LocalDate ld = LocalDate.parse(created.substring(0, 10));
                postedDate = Date.from(ld.atStartOfDay(ZoneId.systemDefault()).toInstant());
            } catch (Exception ignored) {}
        }
        if (postedDate == null) {
            postedDate = new Date();
        }
        job.setPostedAt(postedDate);

        // Expiration: 30 days after posted
        Calendar cal = Calendar.getInstance();
        cal.setTime(postedDate);
        cal.add(Calendar.DAY_OF_MONTH, 30);
        job.setExpiresAt(cal.getTime());

        return job;
    }

    private String text(JsonNode node, String field) {
        JsonNode v = node.get(field);
        if (v == null || v.isNull()) return null;
        String s = v.asText("").trim();
        return s.isEmpty() ? null : s;
    }
}

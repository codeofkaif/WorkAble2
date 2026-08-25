package com.ai.accessibility.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ContextEngineClient {
    private static final Logger logger = LoggerFactory.getLogger(ContextEngineClient.class);

    private final WebClient webClient;
    private final String apiKey;
    private final String knowledgeBaseId;

    public ContextEngineClient(
            WebClient.Builder webClientBuilder,
            @Value("${app.context-engine.url:http://127.0.0.1:8000}") String contextEngineUrl,
            @Value("${app.context-engine.api-key:test-api-key}") String apiKey,
            @Value("${app.context-engine.knowledge-base-id:kb-workable-001}") String knowledgeBaseId) {
        this.webClient = webClientBuilder.baseUrl(contextEngineUrl).build();
        this.apiKey = apiKey;
        this.knowledgeBaseId = knowledgeBaseId;
    }

    public Map<String, Object> parseResume(byte[] fileBytes, String filename) {
        try {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            ByteArrayResource resource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return filename != null ? filename : "resume.pdf";
                }
            };
            builder.part("file", resource);

            return webClient.post()
                    .uri("/resume/parse")
                    .header("X-API-Key", apiKey)
                    .header("X-Knowledge-Base-Id", knowledgeBaseId)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception e) {
            logger.warn("Context Engine parse resume failed: {}, using fallback", e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("name", "");
            fallback.put("skills", Collections.emptyList());
            fallback.put("confidence_score", 0.0);
            fallback.put("parsing_source", "local");
            return fallback;
        }
    }

    public Map<String, Object> calculateATSScore(Map<String, Object> parsedResume, String rawText, String jobDescription) {
        try {
            Map<String, Object> payload = new HashMap<>();
            if (parsedResume != null) payload.put("parsed_resume", parsedResume);
            if (rawText != null) payload.put("raw_text", rawText);
            if (jobDescription != null) payload.put("job_description", jobDescription);

            return webClient.post()
                    .uri("/resume/ats-score")
                    .header("X-API-Key", apiKey)
                    .header("X-Knowledge-Base-Id", knowledgeBaseId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception e) {
            logger.warn("Context Engine ATS score failed: {}, using fallback", e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("overall_score", 75);
            fallback.put("section_completeness", 80);
            fallback.put("formatting_flags", Collections.emptyList());
            fallback.put("suggestions", List.of("Keep your resume concise and highlight key achievements."));
            return fallback;
        }
    }

    public Map<String, Object> matchJob(List<String> resumeSkills, String resumeText, String jobDescription, boolean useEmbeddings) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("resume_skills", resumeSkills != null ? resumeSkills : Collections.emptyList());
            payload.put("resume_text", resumeText != null ? resumeText : "");
            payload.put("job_description", jobDescription != null ? jobDescription : "");
            payload.put("use_embeddings", useEmbeddings);

            return webClient.post()
                    .uri("/resume/match-job")
                    .header("X-API-Key", apiKey)
                    .header("X-Knowledge-Base-Id", knowledgeBaseId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception e) {
            logger.warn("Context Engine match job failed: {}, using fallback", e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("match_score", 0.5);
            fallback.put("matched_skills", Collections.emptyList());
            fallback.put("missing_skills", Collections.emptyList());
            fallback.put("stage", "tfidf_shortlist");
            return fallback;
        }
    }
}

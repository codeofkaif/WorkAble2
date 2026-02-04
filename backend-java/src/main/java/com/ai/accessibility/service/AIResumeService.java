package com.ai.accessibility.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * AI Resume Service - Uses Gemini API (matches Node.js GoogleGenerativeAI behavior)
 */
@Service
public class AIResumeService {
    
    private static final Logger logger = LoggerFactory.getLogger(AIResumeService.class);
    
    @Value("${app.gemini.api-key}")
    private String geminiApiKey;
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    private static final String GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    
    public AIResumeService() {
        this.webClient = WebClient.builder()
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Generate resume using Gemini API - Matches Node.js behavior exactly
     */
    public Map<String, Object> generateResume(String prompt, String template) {
        if (prompt == null || prompt.trim().isEmpty()) {
            throw new IllegalArgumentException("Prompt is required for AI generation");
        }
        
        // Validate API key
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            throw new IllegalStateException("GEMINI_API_KEY is not configured. Please set the environment variable or update application.yml");
        }
        
        // Build Gemini prompt - matches Node.js prompt exactly
        String geminiPrompt = buildGeminiPrompt(prompt);
        
        // Prepare request body - Gemini REST API format
        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> part = new HashMap<>();
        part.put("text", geminiPrompt);
        
        Map<String, Object> content = new HashMap<>();
        content.put("parts", java.util.List.of(part));
        
        requestBody.put("contents", java.util.List.of(content));
        
        // Call Gemini API
        String url = GEMINI_API_BASE + "?key=" + geminiApiKey;
        
        logger.info("Calling Gemini API: {}", GEMINI_API_BASE);
        logger.debug("Request body size: {} chars", geminiPrompt.length());
        logger.debug("API Key present: {}", geminiApiKey != null && !geminiApiKey.isEmpty());
        
        try {
            String response = webClient.post()
                    .uri(url)
                    .body(BodyInserters.fromValue(requestBody))
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), 
                        clientResponse -> {
                            logger.error("Gemini API HTTP error: {}", clientResponse.statusCode());
                            return clientResponse.bodyToMono(String.class)
                                .doOnNext(body -> logger.error("Error response body: {}", body))
                                .then(Mono.error(new RuntimeException("Gemini API returned error: " + clientResponse.statusCode())));
                        })
                    .bodyToMono(String.class)
                    .block();
            
            logger.debug("Gemini API response received: {} chars", response != null ? response.length() : 0);
            
            if (response == null || response.trim().isEmpty()) {
                throw new RuntimeException("Empty response from Gemini API");
            }
            
            // Parse response
            JsonNode jsonResponse;
            try {
                jsonResponse = objectMapper.readTree(response);
            } catch (Exception parseError) {
                logger.error("Failed to parse Gemini response as JSON: {}", response.substring(0, Math.min(500, response.length())));
                throw new RuntimeException("Invalid JSON response from Gemini API: " + parseError.getMessage(), parseError);
            }
            
            // Check for errors in response
            if (jsonResponse.has("error")) {
                JsonNode errorNode = jsonResponse.get("error");
                String errorMessage = errorNode.has("message") 
                    ? errorNode.get("message").asText() 
                    : "Unknown error from Gemini API";
                String errorCode = errorNode.has("code") 
                    ? errorNode.get("code").asText() 
                    : "UNKNOWN";
                logger.error("Gemini API error: {} (code: {})", errorMessage, errorCode);
                throw new RuntimeException("Gemini API error: " + errorMessage + " (code: " + errorCode + ")");
            }
            
            String extractedContent = extractContentFromResponse(jsonResponse);
            
            if (extractedContent == null || extractedContent.trim().isEmpty()) {
                throw new RuntimeException("No content extracted from Gemini response");
            }
            
            // Parse JSON from response
            Map<String, Object> aiGeneratedData = parseJsonFromContent(extractedContent);
            
            return aiGeneratedData;
            
        } catch (RuntimeException e) {
            throw e; // Re-throw runtime exceptions as-is
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate AI resume: " + e.getMessage(), e);
        }
    }
    
    private String buildGeminiPrompt(String userPrompt) {
        return "You are a professional resume writer. Generate structured resume data in JSON format.\n\n" +
               "Create a professional resume based on the following information. " +
               "Format it as a structured JSON object with the following sections:\n" +
               "- personalInfo (fullName, email, phone, summary)\n" +
               "- experience (array of work experiences)\n" +
               "- education (array of educational background)\n" +
               "- skills (technical, soft, languages)\n" +
               "- projects (array of relevant projects)\n" +
               "- certifications (array of certifications)\n\n" +
               "User input: " + userPrompt + "\n\n" +
               "Please create a professional resume with the following structure:\n" +
               "{\n" +
               "  \"personalInfo\": {\n" +
               "    \"fullName\": \"string\",\n" +
               "    \"email\": \"string\",\n" +
               "    \"phone\": \"string\",\n" +
               "    \"summary\": \"string\"\n" +
               "  },\n" +
               "  \"experience\": [\n" +
               "    {\n" +
               "      \"company\": \"string\",\n" +
               "      \"position\": \"string\",\n" +
               "      \"startDate\": \"string\",\n" +
               "      \"description\": \"string\"\n" +
               "    }\n" +
               "  ],\n" +
               "  \"skills\": {\n" +
               "    \"technical\": [\"string\"],\n" +
               "    \"soft\": [\"string\"]\n" +
               "  }\n" +
               "}\n\n" +
               "Make it professional, concise, and tailored for job applications. " +
               "Focus on achievements and measurable results. Return only valid JSON.";
    }
    
    private String extractContentFromResponse(JsonNode jsonResponse) {
        try {
            JsonNode candidates = jsonResponse.get("candidates");
            if (candidates != null && candidates.isArray() && candidates.size() > 0) {
                JsonNode candidate = candidates.get(0);
                JsonNode contentNode = candidate.get("content");
                if (contentNode != null) {
                    JsonNode parts = contentNode.get("parts");
                    if (parts != null && parts.isArray() && parts.size() > 0) {
                        JsonNode part = parts.get(0);
                        JsonNode text = part.get("text");
                        if (text != null) {
                            return text.asText();
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Fallback: try to extract text from response
        }
        return jsonResponse.toString();
    }
    
    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJsonFromContent(String contentText) {
        try {
            // Try to extract JSON from markdown code blocks or plain JSON
            Pattern jsonPattern = Pattern.compile("```(?:json)?\\s*([\\s\\S]*?)\\s*```", Pattern.CASE_INSENSITIVE);
            Matcher matcher = jsonPattern.matcher(contentText);
            if (matcher.find()) {
                contentText = matcher.group(1);
            }
            
            // Try to find JSON object in content
            Pattern objectPattern = Pattern.compile("\\{([^{}]*(?:\\{[^{}]*\\}[^{}]*)*)\\}");
            matcher = objectPattern.matcher(contentText);
            if (matcher.find()) {
                contentText = "{" + matcher.group(1) + "}";
            }
            
            return (Map<String, Object>) objectMapper.readValue(contentText, Map.class);
        } catch (Exception e) {
            // If parsing fails, return basic structure
            Map<String, Object> fallback = new HashMap<>();
            Map<String, Object> personalInfo = new HashMap<>();
            personalInfo.put("fullName", "");
            personalInfo.put("email", "");
            personalInfo.put("phone", "");
            personalInfo.put("summary", contentText.substring(0, Math.min(500, contentText.length())));
            fallback.put("personalInfo", personalInfo);
            fallback.put("experience", java.util.List.of());
            fallback.put("education", java.util.List.of());
            Map<String, Object> skills = new HashMap<>();
            skills.put("technical", java.util.List.of());
            skills.put("soft", java.util.List.of());
            fallback.put("skills", skills);
            fallback.put("projects", java.util.List.of());
            return fallback;
        }
    }
}

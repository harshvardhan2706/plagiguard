package com.plagiguard.util;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

@Component
public class AIDetectorClient {
    private static final Logger LOGGER = LoggerFactory.getLogger(AIDetectorClient.class);
    private static final int MAX_RETRIES = 3;
    private static final int RETRY_DELAY_MS = 2000;
    
    // Set the AI microservice URL as a constant for deployment
    private final String AI_API_URL = "http://0.0.0.0:5000";
    private final String aiDetectorUrl;
    private final RestTemplate restTemplate;
    
    public AIDetectorClient(
        @Value("${ai.detector.url:http://localhost:5000}") String aiDetectorUrl,
        RestTemplate restTemplate
    ) {
        // Use the constant if not running locally
        if (AI_API_URL.startsWith("http")) {
            this.aiDetectorUrl = AI_API_URL + "/detect";
        } else {
            this.aiDetectorUrl = aiDetectorUrl + "/detect";
        }
        this.restTemplate = restTemplate;
    }
    
    public JSONObject checkAIContent(String text) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        JSONObject request = new JSONObject();
        request.put("text", text);
        
        HttpEntity<String> entity = new HttpEntity<>(request.toString(), headers);
        Exception lastException = null;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                LOGGER.info("Attempting to connect to AI detector (attempt {}/{})", attempt, MAX_RETRIES);
                
                ResponseEntity<String> response = restTemplate.postForEntity(
                    aiDetectorUrl, 
                    entity, 
                    String.class
                );
                
                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    JSONObject result = new JSONObject(response.getBody());
                    if ("success".equals(result.optString("status"))) {
                        return result;
                    }
                    throw new RuntimeException("Invalid response from AI detector: " + response.getBody());
                }
                
                throw new RuntimeException("Invalid response code from AI detector: " + response.getStatusCode());
                
            } catch (ResourceAccessException e) {
                lastException = e;
                LOGGER.error("Failed to connect to AI detector (attempt {}/{}): {}", 
                    attempt, MAX_RETRIES, e.getMessage());
                
                if (attempt < MAX_RETRIES) {
                    try {
                        Thread.sleep(RETRY_DELAY_MS);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Interrupted while waiting to retry", ie);
                    }
                }
            } catch (Exception e) {
                lastException = e;
                LOGGER.error("Error from AI detector (attempt {}/{}): {}", 
                    attempt, MAX_RETRIES, e.getMessage());
                
                if (attempt < MAX_RETRIES) {
                    try {
                        Thread.sleep(RETRY_DELAY_MS);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Interrupted while waiting to retry", ie);
                    }
                }
            }
        }

        throw new RuntimeException("Failed to get response from AI detector after " + 
            MAX_RETRIES + " attempts. Last error: " + 
            (lastException != null ? lastException.getMessage() : "Unknown error"));
    }
}

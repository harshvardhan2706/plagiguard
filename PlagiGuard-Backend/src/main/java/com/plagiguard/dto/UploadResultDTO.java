package com.plagiguard.dto;

import java.util.List;

public class UploadResultDTO {
    private boolean success;
    private String message;
    private String fileName;
    private Double similarityScore;
    private String content;
    private List<Integer> aiParts;

    public UploadResultDTO() {}

    public UploadResultDTO(boolean success, String message, String fileName) {
        this.success = success;
        this.message = message;
        this.fileName = fileName;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Double getSimilarityScore() {
        return similarityScore;
    }

    public void setSimilarityScore(Double similarityScore) {
        this.similarityScore = similarityScore;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<Integer> getAiParts() {
        return aiParts;
    }

    public void setAiParts(List<Integer> aiParts) {
        this.aiParts = aiParts;
    }
}
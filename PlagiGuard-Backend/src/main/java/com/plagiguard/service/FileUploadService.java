package com.plagiguard.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.plagiguard.dto.UploadResultDTO;
import com.plagiguard.entity.Upload;
import com.plagiguard.entity.User;
import com.plagiguard.repository.UploadRepository;
import com.plagiguard.repository.UserRepository;
import com.plagiguard.util.AIDetectorClient;
import com.plagiguard.util.FileTextExtractor;

import jakarta.persistence.EntityNotFoundException;

@Service
public class FileUploadService {
    
    private static final Logger logger = LoggerFactory.getLogger(FileUploadService.class);

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UploadRepository uploadRepository;

    @Autowired
    private AIDetectorClient aiDetectorClient;

    public UploadResultDTO uploadFile(MultipartFile file, Long userId) {
        try {
            if (file.isEmpty()) {
                return new UploadResultDTO(false, "Failed to upload empty file", null);
            }
            
            logger.debug("Processing upload for user ID: {}", userId);
            User user = userRepository.findById(userId.intValue())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
            return processUpload(file, user);
        } catch (EntityNotFoundException e) {
            logger.error("User not found error: {}", e.getMessage());
            return new UploadResultDTO(false, e.getMessage(), null);
        } catch (IOException e) {
            logger.error("IO error during upload: {}", e.getMessage(), e);
            return new UploadResultDTO(false, "Failed to process file: " + e.getMessage(), null);
        } catch (Exception e) {
            logger.error("Unexpected error during upload: {}", e.getMessage(), e);
            return new UploadResultDTO(false, "Unexpected error during upload: " + e.getMessage(), null);
        }
    }


    public UploadResultDTO uploadFileByEmail(MultipartFile file, String email) {
        try {
            if (file.isEmpty()) {
                return new UploadResultDTO(false, "Failed to upload empty file", null);
            }
            logger.debug("Processing upload for email: {}", email);
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
            return processUpload(file, user);
        } catch (EntityNotFoundException e) {
            logger.error("User not found error: {}", e.getMessage());
            return new UploadResultDTO(false, e.getMessage(), null);
        } catch (IOException e) {
            logger.error("IO error during upload: {}", e.getMessage(), e);
            return new UploadResultDTO(false, "Failed to process file: " + e.getMessage(), null);
        } catch (Exception e) {
            logger.error("Unexpected error during upload: {}", e.getMessage(), e);
            return new UploadResultDTO(false, "Unexpected error during upload: " + e.getMessage(), null);
        }
    }

    private UploadResultDTO processUpload(MultipartFile file, User user) throws Exception {

        String originalFilename = file.getOriginalFilename();
        String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFilename;
        logger.debug("Processing file: {} (unique: {}) in memory", originalFilename, uniqueFileName);

        // Extract text directly from the MultipartFile stream
        String extractedText = FileTextExtractor.extractText(file);
        if (extractedText == null || extractedText.trim().isEmpty()) {
            logger.error("Failed to extract text from file: {}", originalFilename);
            return new UploadResultDTO(false, "Failed to extract text from file", originalFilename);
        }
        
        logger.debug("Analyzing text with AI detector");        // Check AI content
        JSONObject aiResult = aiDetectorClient.checkAIContent(extractedText);
        double aiScore = aiResult.getDouble("ai_score");
        boolean isAiGenerated = aiResult.getBoolean("ai_generated");
        
        // Create a simple list of AI-detected parts
        List<Integer> aiParts = new ArrayList<>();
        if (isAiGenerated) {
            String[] words = extractedText.split("\\s+");
            for (int i = 0; i < words.length; i++) {
                if (Math.random() < aiScore) { // Use AI score as probability
                    aiParts.add(i);
                }
            }
        }
        

        // Save to database only
        Upload upload = new Upload();
        upload.setFilename(uniqueFileName);
        upload.setOriginalFilename(originalFilename);
        upload.setUploadDate(LocalDateTime.now());
        upload.setSimilarityScore(aiScore);
        upload.setUser(user);
        upload.setFileData(file.getBytes());
        Upload savedUpload = uploadRepository.save(upload);
        logger.debug("Saved upload to database with ID: {}", savedUpload.getId());
        
        String message = isAiGenerated ? 
            String.format("File processed. AI content detected (%.2f%% confidence)", aiScore * 100) :
            String.format("File processed. No significant AI content detected (%.2f%% confidence)", aiScore * 100);
            
        UploadResultDTO result = new UploadResultDTO(true, message, originalFilename);
        result.setSimilarityScore(aiScore);
        result.setContent(extractedText);
        result.setAiParts(aiParts);
        
        return result;
    }
}

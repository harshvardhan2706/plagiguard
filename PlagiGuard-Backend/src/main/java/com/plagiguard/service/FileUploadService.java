package com.plagiguard.service;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
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
    
    private final Path uploadDir = Paths.get("uploads");
    
    @Value("${file.upload-dir:./uploads}")
    private String uploadPath;

    public FileUploadService() {
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    public String getUploadPath() {
        return uploadPath;
    }

    public Resource loadFileAsResource(String filePath) throws Exception {
        try {
            Path path = Paths.get(filePath);
            Resource resource = new UrlResource(path.toUri());
            
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found: " + filePath);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("File not found: " + filePath, e);
        }
    }

    public void deleteFile(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        Files.deleteIfExists(path);
    }
    
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
        Path filePath = uploadDir.resolve(uniqueFileName);
        
        logger.debug("Saving file: {} to path: {}", originalFilename, filePath);
        
        // Save file with REPLACE_EXISTING to handle cases where file might already exist
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Extract text from the file
        File savedFile = filePath.toFile();
        String extractedText = FileTextExtractor.extractText(savedFile);
        
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
        
        // Save to database
        Upload upload = new Upload();
        upload.setFilename(uniqueFileName);
        upload.setOriginalFilename(originalFilename);
        upload.setUploadDate(LocalDateTime.now());
        upload.setSimilarityScore(aiScore);
        upload.setUser(user);
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

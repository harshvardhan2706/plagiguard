package com.plagiguard.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.plagiguard.dto.UploadResultDTO;
import com.plagiguard.entity.Upload;
import com.plagiguard.entity.User;
import com.plagiguard.repository.UploadRepository;
import com.plagiguard.repository.UserRepository;
import com.plagiguard.service.FileUploadService;

import jakarta.persistence.EntityNotFoundException;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"}, allowCredentials = "true")
public class FileUploadController {
    
    @Autowired
    private FileUploadService fileUploadService;
      @PostMapping("/upload/user")
    public ResponseEntity<UploadResultDTO> uploadFileByUserId(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId) {
        try {
            System.out.println("Received file upload request:");
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());
            System.out.println("User ID: " + userId);
            UploadResultDTO result = fileUploadService.uploadFile(file, userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new UploadResultDTO(false, "Failed to upload file: " + e.getMessage(), null));
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<UploadResultDTO> uploadFileByEmail(
            @RequestParam("file") MultipartFile file,
            @RequestParam("email") String email) {
        try {
            UploadResultDTO result = fileUploadService.uploadFileByEmail(file, email);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new UploadResultDTO(false, "Failed to upload file: " + e.getMessage(), null));
        }
    }    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getUploadHistory(@PathVariable Long userId) {
        try {
            // Validate user exists
            User user = userRepository.findById(userId.intValue())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
            
            // Get all uploads for the user
            List<Upload> uploads = uploadRepository.findByUser(user);
            
            // Convert uploads to DTOs
            List<Map<String, Object>> uploadHistory = uploads.stream()
                .map(upload -> {
                    Map<String, Object> historyItem = new HashMap<>();
                    historyItem.put("id", upload.getId());
                    historyItem.put("filename", upload.getFilename());
                    historyItem.put("percentAI", upload.getSimilarityScore() != null ? 
                        Math.round(upload.getSimilarityScore() * 100) : 0);
                    historyItem.put("timestamp", upload.getUploadDate().toString());
                    return historyItem;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of("uploads", uploadHistory));
        } catch (EntityNotFoundException e) {
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch history: " + e.getMessage()));
        }
    }

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UploadRepository uploadRepository;
}

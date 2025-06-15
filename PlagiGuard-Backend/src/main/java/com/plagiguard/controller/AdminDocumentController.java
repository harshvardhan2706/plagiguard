package com.plagiguard.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.plagiguard.entity.Upload;
import com.plagiguard.repository.UploadRepository;
import com.plagiguard.service.FileUploadService;

@RestController
@RequestMapping("/api/admin/documents")
@CrossOrigin(origins = {"http://localhost:3000"})
public class AdminDocumentController {

    @Autowired
    private UploadRepository uploadRepository;

    @Autowired
    private FileUploadService fileUploadService;

    @GetMapping
    public ResponseEntity<?> getAllDocuments(
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder,
            @RequestParam(required = false) Double aiScoreMin,
            @RequestParam(required = false) Double aiScoreMax,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo) {
        
        try {
            List<Upload> documents = uploadRepository.findAll();
            
            // Filter documents based on criteria
            documents = documents.stream()
                .filter(doc -> {
                    if (aiScoreMin != null && doc.getSimilarityScore() < aiScoreMin/100.0) return false;
                    if (aiScoreMax != null && doc.getSimilarityScore() > aiScoreMax/100.0) return false;
                    
                    if (dateFrom != null) {
                        try {
                            if (doc.getUploadDate().toLocalDate().isBefore(java.time.LocalDate.parse(dateFrom))) {
                                return false;
                            }
                        } catch (Exception e) {
                            // Invalid date format, ignore this filter
                        }
                    }
                    
                    if (dateTo != null) {
                        try {
                            if (doc.getUploadDate().toLocalDate().isAfter(java.time.LocalDate.parse(dateTo))) {
                                return false;
                            }
                        } catch (Exception e) {
                            // Invalid date format, ignore this filter
                        }
                    }
                    
                    return true;
                })
                .sorted((a, b) -> {
                    if (sortBy == null) return 0;
                    int multiplier = "asc".equalsIgnoreCase(sortOrder) ? 1 : -1;
                    return switch (sortBy) {
                        case "file_name" -> multiplier * a.getFilename().compareTo(b.getFilename());
                        case "user_email" -> multiplier * a.getUser().getEmail().compareTo(b.getUser().getEmail());
                        case "ai_score" -> multiplier * Double.compare(a.getSimilarityScore(), b.getSimilarityScore());
                        case "upload_date" -> multiplier * a.getUploadDate().compareTo(b.getUploadDate());
                        default -> 0;
                    };
                })
                .collect(Collectors.toList());

            // Convert to response format
            List<Map<String, Object>> response = documents.stream()
                .map(doc -> {
                    Map<String, Object> docMap = new HashMap<>();
                    docMap.put("id", doc.getId());
                    docMap.put("fileName", doc.getOriginalFilename() != null ? doc.getOriginalFilename() : doc.getFilename());
                    docMap.put("userEmail", doc.getUser().getEmail());
                    docMap.put("uploadDate", doc.getUploadDate().toString());
                    docMap.put("aiScore", Math.round(doc.getSimilarityScore() * 100));
                    return docMap;
                })
                .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to fetch documents: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        try {
            Upload upload = uploadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
            
            // Delete the physical file
            String filePath = fileUploadService.getUploadPath() + "/" + upload.getFilename();
            fileUploadService.deleteFile(filePath);
            
            // Delete the database record
            uploadRepository.deleteById(id);
            
            return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to delete document: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadDocument(@PathVariable Long id) {
        try {
            Upload upload = uploadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
            
            String filePath = fileUploadService.getUploadPath() + "/" + upload.getFilename();
            Resource resource = fileUploadService.loadFileAsResource(filePath);
            
            String contentType = "application/octet-stream";
            String fileName = upload.getOriginalFilename() != null ? upload.getOriginalFilename() : upload.getFilename();
            String headerValue = "attachment; filename=\"" + fileName + "\"";
            
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, headerValue)
                .body(resource);
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to download document: " + e.getMessage()));
        }
    }
}

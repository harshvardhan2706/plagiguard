package com.plagiguard.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.plagiguard.repository.UploadRepository;
import com.plagiguard.repository.UserRepository;

@RestController
@RequestMapping("https://plagiguard-backend.onrender.com/api/admin/dashboard")
// @CrossOrigin(origins = {"http://localhost:3000"})
public class AdminDashboardController {

    @Autowired
    private UploadRepository uploadRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Get total documents
            long totalDocuments = uploadRepository.count();
            stats.put("totalDocuments", totalDocuments);
            
            // Get total users
            long totalUsers = userRepository.count();
            stats.put("totalUsers", totalUsers);
            
            // Get today's uploads
            LocalDate today = LocalDate.now();
            long todaysUploads = uploadRepository.countByUploadDateBetween(
                today.atStartOfDay(),
                today.plusDays(1).atStartOfDay()
            );
            stats.put("documentsToday", todaysUploads);
            
            // Calculate average AI score
            Double avgScore = uploadRepository.findAverageAIScore();
            stats.put("averageAIScore", avgScore != null ? Math.round(avgScore * 100) : 0);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to fetch dashboard statistics: " + e.getMessage()));
        }
    }
}

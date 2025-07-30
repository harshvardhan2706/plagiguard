package com.plagiguard.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.plagiguard.dto.AdminDTO;
import com.plagiguard.entity.Admin;
import com.plagiguard.repository.AdminRepository;

@Service
public class AdminService {
    private static final Logger LOGGER = LoggerFactory.getLogger(AdminService.class);

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Admin authenticateAdmin(String username, String password) {
        Optional<Admin> admin = adminRepository.findByUsername(username);
        
        if (admin.isEmpty()) {
            LOGGER.warn("Admin not found: {}", username);
            return null;
        }

        if (passwordEncoder.matches(password, admin.get().getPassword())) {
            Admin authenticatedAdmin = admin.get();
            authenticatedAdmin.setLastLogin(LocalDateTime.now());
            LOGGER.info("Admin authenticated successfully: {}", username);
            return adminRepository.save(authenticatedAdmin);
        } else {
            LOGGER.warn("Password mismatch for admin: {}", username);
            return null;
        }
    }

    public Admin getAdminById(Long id) {
        return adminRepository.findById(id).orElse(null);
    }

    public Admin getAdminByUsername(String username) {
        return adminRepository.findByUsername(username).orElse(null);
    }
    
    public Admin getAdminByEmail(String email) {
        return adminRepository.findByEmail(email).orElse(null);
    }

    public Admin createAdmin(Admin admin) {
        LOGGER.info("Creating new admin: {}", admin.getUsername());
        // Validate input
        if (admin.getPassword() == null || admin.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }
        // Do NOT hash the password here; it should already be hashed in the controller
        admin.setCreatedAt(LocalDateTime.now());
        try {
            Admin createdAdmin = adminRepository.save(admin);
            LOGGER.info("Admin created successfully: {}", createdAdmin.getUsername());
            return createdAdmin;
        } catch (Exception e) {
            LOGGER.error("Error creating admin: {}", admin.getUsername(), e);
            throw e;
        }
    }

    public Admin updateAdmin(Admin admin) {
        Admin existingAdmin = adminRepository.findById(admin.getId()).orElse(null);
        if (existingAdmin != null) {
            if (admin.getPassword() != null && !admin.getPassword().isEmpty()) {
                admin.setPassword(passwordEncoder.encode(admin.getPassword()));
            } else {
                admin.setPassword(existingAdmin.getPassword());
            }
            return adminRepository.save(admin);
        }
        return null;
    }

    public AdminDTO convertToDTO(Admin admin) {
        if (admin == null) return null;
        
        AdminDTO dto = new AdminDTO();
        dto.setId(admin.getId());
        dto.setUsername(admin.getUsername());
        dto.setFullName(admin.getFullName());
        dto.setEmail(admin.getEmail());
        dto.setRole(admin.getRole());
        dto.setLastLogin(admin.getLastLogin());
        return dto;
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // TODO: Implement actual statistics gathering
        stats.put("totalUsers", adminRepository.count());
        stats.put("totalUploads", 0); // Implement this
        stats.put("avgAiScore", 0.0); // Implement this
        stats.put("activeUsers", 0); // Implement this
        
        return stats;
    }

    public Map<String, Object> getSystemSettings() {
        Map<String, Object> settings = new HashMap<>();
        settings.put("emailNotifications", true);
        settings.put("darkMode", false);
        settings.put("aiThreshold", 70);
        settings.put("maxFileSize", 10);
        settings.put("allowedFileTypes", ".txt,.doc,.docx,.pdf");
        settings.put("backupInterval", "daily");
        return settings;
    }

    public boolean updateSystemSettings(Map<String, Object> settings) {
        // TODO: Implement settings persistence
        return true;
    }
}

package com.plagiguard.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.plagiguard.dto.AdminLoginRequest;
import com.plagiguard.dto.AdminSignupRequest;
import com.plagiguard.entity.Admin;
import com.plagiguard.repository.AdminRepository;
import com.plagiguard.service.AdminService;
import com.plagiguard.service.JwtService;

@RestController
@RequestMapping("https://plagiguard-backend.onrender.com/api/admin")
// @CrossOrigin(origins = {"http://localhost:3000"})
public class AdminController {    private static final Logger LOGGER = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private AdminService adminService;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody AdminSignupRequest request) {        LOGGER.info("=== Admin Signup Request ===");
        LOGGER.info("Username: {}", request.getUsername());
        LOGGER.info("Full Name: {}", request.getFullName());
        LOGGER.info("Email: {}", request.getEmail());
        LOGGER.info("[DEBUG] Raw password at signup: '{}', length: {}", request.getPassword(), request.getPassword() != null ? request.getPassword().length() : 0);
        
        try {
            // Validate input
            if (request.getUsername() == null || request.getUsername().trim().isEmpty() ||
                request.getPassword() == null || request.getPassword().trim().isEmpty() ||
                request.getEmail() == null || request.getEmail().trim().isEmpty() ||
                request.getFullName() == null || request.getFullName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "All fields are required"));
            }

            // Check if username exists
            Optional<Admin> existingAdminByUsername = adminRepository.findByUsername(request.getUsername());
            if (existingAdminByUsername.isPresent()) {
                LOGGER.info("Username already exists: {}", request.getUsername());
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Username already exists"));
            }

            // Check if email exists
            Optional<Admin> existingAdminByEmail = adminRepository.findByEmail(request.getEmail());
            if (existingAdminByEmail.isPresent()) {
                LOGGER.info("Email already exists: {}", request.getEmail());
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email already exists"));
            }

            // Create new admin
            Admin newAdmin = new Admin();
            newAdmin.setUsername(request.getUsername().trim());
            newAdmin.setPassword(passwordEncoder.encode(request.getPassword())); // Encode the password
            newAdmin.setFullName(request.getFullName().trim());
            newAdmin.setEmail(request.getEmail().trim());
            newAdmin.setRole("ADMIN");
              LOGGER.info("Created new admin object, attempting to save...");
            
            Admin createdAdmin = adminService.createAdmin(newAdmin);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", createdAdmin.getId());
            response.put("username", createdAdmin.getUsername());
            response.put("fullName", createdAdmin.getFullName());
            response.put("email", createdAdmin.getEmail());
            response.put("role", createdAdmin.getRole());
            
            return ResponseEntity.ok(response);
            
        } catch (DataIntegrityViolationException e) {            LOGGER.error("Database error during admin signup", e);
            return ResponseEntity.status(409)
                .body(Map.of("error", "Username or email already exists"));
        } catch (Exception e) {            LOGGER.error("Error during admin signup", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Server error occurred: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminLoginRequest credentials) {
        try {            LOGGER.info("Admin login attempt for username: {}", credentials.getUsername());
            
            Optional<Admin> adminOpt = adminRepository.findByUsername(credentials.getUsername());
            
            if (adminOpt.isEmpty()) {                LOGGER.warn("Admin not found for username: {}", credentials.getUsername());
                return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid username or password"));
            }

            Admin admin = adminOpt.get();
            String rawPassword = credentials.getPassword();
            String hashedPassword = admin.getPassword();
            LOGGER.info("[DEBUG] Raw password at login: '{}', length: {}", rawPassword, rawPassword != null ? rawPassword.length() : 0);
              LOGGER.debug("Comparing passwords for admin: {}", admin.getUsername());
            LOGGER.debug("Raw password length: {}", rawPassword.length());
            LOGGER.debug("Hashed password: {}", hashedPassword);

            if (!passwordEncoder.matches(rawPassword, hashedPassword)) {
                LOGGER.warn("Password mismatch for admin: {}", admin.getUsername());
                return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid username or password"));
            }            LOGGER.info("Admin authenticated successfully: {}", admin.getUsername());

            // Generate JWT token
            String token = jwtService.generateToken(admin.getUsername(), "ADMIN");
            
            if (token == null || token.isEmpty()) {            
                    LOGGER.error("Token generation failed for admin: {}", admin.getUsername());
                throw new IllegalStateException("Failed to generate authentication token");
            }

            // Update last login time
            admin.setLastLogin(LocalDateTime.now());
            admin = adminRepository.save(admin);

            Map<String, Object> response = new HashMap<>();
            response.put("id", admin.getId());
            response.put("username", admin.getUsername());
            response.put("fullName", admin.getFullName());
            response.put("email", admin.getEmail());
            response.put("role", admin.getRole());
            response.put("lastLogin", admin.getLastLogin());
            response.put("password", admin.getPassword()); // Do not return password
            LOGGER.debug("Generated token for admin: {}", admin.getUsername());
            response.put("token", token);
            LOGGER.info("Login successful for admin: {}", admin.getUsername());
            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            LOGGER.error("Token generation error for admin: {}", credentials.getUsername(), e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Authentication failed: " + e.getMessage()));
        } catch (Exception e) {
            LOGGER.error("Login error for admin: {}", credentials.getUsername(), e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Server error occurred: " + e.getMessage()));
        }
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        try {
            Map<String, Object> settings = adminService.getSystemSettings();
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Failed to fetch system settings"));
        }
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, Object> settings) {
        try {
            boolean updated = adminService.updateSystemSettings(settings);
            if (updated) {
                return ResponseEntity.ok(Map.of("message", "Settings updated successfully"));
            }
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to update settings"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Server error occurred while updating settings"));
        }
    }
}

package com.plagiguard.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.plagiguard.entity.PasswordResetToken;
import com.plagiguard.entity.User;
import com.plagiguard.repository.PasswordResetTokenRepository;
import com.plagiguard.repository.UserRepository;
import com.plagiguard.service.EmailService;
import com.plagiguard.service.JwtService;

@RestController
@RequestMapping("https://plagiguard-backend.onrender.com/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private JwtService jwtService;

    @PostMapping("https://plagiguard-backend.onrender.com/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("error", "Email already exists"));
        }
        
        try {
            System.out.println("[REGISTER] Incoming registration request: " + user);
            if (user.getRole() == null) {
                user.setRole("USER");
            }
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            User savedUser = userRepository.save(user);
            System.out.println("[REGISTER] User saved: " + savedUser.getEmail());

            // Generate JWT token
            String token = jwtService.generateToken(savedUser.getEmail(), savedUser.getRole());

            Map<String, Object> response = new HashMap<>();
            response.put("id", savedUser.getId());
            response.put("email", savedUser.getEmail());
            response.put("fullName", savedUser.getFullName());
            response.put("role", savedUser.getRole());
            response.put("token", token);
            System.out.println("[REGISTER] Registration successful for: " + savedUser.getEmail());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("[REGISTER] Registration failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to register user"));
        }
    }    @PostMapping("/login")    
    public ResponseEntity<?> login(@RequestBody User loginUser) {
        try {
            System.out.println("Login attempt for email: " + loginUser.getEmail());
            
            Optional<User> userOpt = userRepository.findByEmail(loginUser.getEmail());
            if (userOpt.isEmpty()) {
                System.out.println("User not found: " + loginUser.getEmail());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
            }

            User user = userOpt.get();
            System.out.println("User found, verifying password...");
            
            if (!passwordEncoder.matches(loginUser.getPassword(), user.getPassword())) {
                System.out.println("Password mismatch for user: " + user.getEmail());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
            }

            System.out.println("Password matched for user: " + user.getEmail());
            
            // First login sets status to active
            if (user.getStatus() == null) {
                user.setStatus("active");
                System.out.println("Setting initial status to active for user: " + user.getEmail());
            }
            
            // Check if user is suspended
            if ("suspended".equals(user.getStatus())) {
                System.out.println("Account is suspended for user: " + user.getEmail());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Account is suspended. Please contact support."));
            }
            
            // Update last login time
            user.setLastLogin(LocalDateTime.now());
            user = userRepository.save(user);
            System.out.println("Updated last login time for user: " + user.getEmail());

            // Generate JWT token
            String token = jwtService.generateToken(user.getEmail(), user.getRole());
            if (token == null || token.isEmpty()) {
                System.err.println("Token generation failed - token is null or empty");
                throw new IllegalStateException("Failed to generate token");
            }
            System.out.println("Successfully generated token for user: " + user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());
            response.put("role", user.getRole());
            response.put("status", user.getStatus());
            response.put("lastLogin", user.getLastLogin());
            response.put("token", token);

            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            System.err.println("Token generation error for user: " + loginUser.getEmail() + " - " + e.getMessage());
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Authentication failed: " + e.getMessage()));
        } catch (RuntimeException e) {
            System.err.println("Login error for email: " + loginUser.getEmail() + " - " + e.getMessage());
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("https://plagiguard-backend.onrender.com/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Email not found"));
        }

        User user = userOpt.get();
        String token = UUID.randomUUID().toString();
        
        passwordResetTokenRepository.deleteByUser_Id(user.getId());
        
        PasswordResetToken resetToken = new PasswordResetToken(token, user);
        passwordResetTokenRepository.save(resetToken);
        
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), token);
            return ResponseEntity.ok(Map.of("message", "Password reset email sent"));
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to send reset email"));
        }
    }

    @PostMapping("https://plagiguard-backend.onrender.com/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("password");
        
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByToken(token);
        
        if (tokenOpt.isEmpty() || tokenOpt.get().isExpired()) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Invalid or expired token"));
        }

        PasswordResetToken resetToken = tokenOpt.get();
        User user = resetToken.getUser();
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        passwordResetTokenRepository.delete(resetToken);
        
        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    @PutMapping("https://plagiguard-backend.onrender.com/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request) {        String userIdStr = request.get("userId");
        if (userIdStr == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "UserId is required"));
        }

        Optional<User> userOpt = userRepository.findById(Integer.valueOf(userIdStr));
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        boolean isUpdated = false;

        try {
            String newName = request.get("fullName");
            if (newName != null && !newName.trim().isEmpty()) {
                user.setFullName(newName.trim());
                isUpdated = true;
            }
            
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            if (newPassword != null && !newPassword.trim().isEmpty()) {
                if (currentPassword == null || currentPassword.trim().isEmpty()) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "Current password is required to change password"));
                }
                
                if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Current password is incorrect"));
                }
                
                user.setPassword(passwordEncoder.encode(newPassword));
                isUpdated = true;
            }

            if (isUpdated) {
                user = userRepository.save(user);
            }
            
            Map<String, Object> response = new HashMap<>();
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("fullName", user.getFullName());
            userData.put("email", user.getEmail());
            
            response.put("message", "Profile updated successfully");
            response.put("user", userData);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update profile"));
        }
    }

    @GetMapping("https://plagiguard-backend.onrender.com/auth-status")
    public ResponseEntity<?> checkAuthStatus() {
        return ResponseEntity.ok(Map.of("message", "Authenticated"));
    }
}
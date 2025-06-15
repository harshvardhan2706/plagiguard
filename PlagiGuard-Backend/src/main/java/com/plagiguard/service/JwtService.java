package com.plagiguard.service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.plagiguard.config.JwtConfig;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Service
public class JwtService {
    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);
    
    private final JwtConfig jwtConfig;
    private SecretKey key;
    
    public JwtService(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
    }
    
    @PostConstruct
    public void init() {
        logger.info("Initializing JwtService...");
        try {
            if (jwtConfig.getSecret() == null || jwtConfig.getSecret().trim().isEmpty()) {
                throw new IllegalStateException("JWT secret key is not configured");
            }

            byte[] keyBytes = jwtConfig.getSecret().getBytes();
            if (keyBytes.length < 32) { // Minimum 256 bits for HS256
                throw new IllegalStateException("JWT secret key must be at least 256 bits");
            }

            this.key = Keys.hmacShaKeyFor(keyBytes);
            
            // Validate expiration time
            if (jwtConfig.getExpiration() <= 0) {
                throw new IllegalStateException("JWT expiration time must be positive");
            }

            logger.info("JWT Service initialized successfully");
            logger.debug("Secret key length: {} bytes", keyBytes.length);
            logger.debug("Token expiration: {}ms", jwtConfig.getExpiration());
        } catch (IllegalStateException | NumberFormatException e) {
            String errorMsg = "Failed to initialize JwtService: " + e.getMessage();
            logger.error(errorMsg, e);
            throw e;
        }
    }

    public String generateToken(String username, String role) {
        if (username == null || username.isEmpty()) {
            throw new IllegalArgumentException("Username cannot be null or empty");
        }
        if (role == null || role.isEmpty()) {
            throw new IllegalArgumentException("Role cannot be null or empty");
        }
        logger.debug("Generating token for username: {} with role: {}", username, role);
        Map<String, Object> claims = new HashMap<>();
        // Store role without ROLE_ prefix - it will be added during authentication
        claims.put("role", role.replace("ROLE_", ""));
        return generateToken(claims, username);
    }

    private String generateToken(Map<String, Object> claims, String subject) {
        // Validate inputs
        if (subject == null || subject.trim().isEmpty()) {
            throw new IllegalArgumentException("Token subject cannot be null or empty");
        }
        
        if (key == null) {
            throw new IllegalStateException("JWT signing key is not initialized");
        }

        try {
            long now = System.currentTimeMillis();
            Map<String, Object> finalClaims = new HashMap<>(claims);
            finalClaims.put("iat", new Date(now));
            finalClaims.put("exp", new Date(now + jwtConfig.getExpiration()));
            if (jwtConfig.getIssuer() != null) {
                finalClaims.put("iss", jwtConfig.getIssuer());
            }
            
            String token = Jwts.builder()
                    .setClaims(finalClaims)
                    .setSubject(subject)
                    .signWith(key)
                    .compact();

            // Validate generated token
            if (token == null || token.trim().isEmpty()) {
                throw new IllegalStateException("Generated token is null or empty");
            }

            // Verify the token can be parsed
            Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
            
            logger.debug("Successfully generated and validated token for subject: {}", subject);
            return token;
        } catch (io.jsonwebtoken.JwtException e) {
            String errorMsg = "Failed to generate JWT token: " + e.getMessage();
            logger.error(errorMsg, e);
            throw new IllegalStateException(errorMsg, e);
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
            
            // Additional validation for required claims
            String username = getUsernameFromToken(token);
            String role = getRoleFromToken(token);
            
            if (username == null || username.trim().isEmpty()) {
                logger.warn("Token validation failed: missing username");
                return false;
            }
            
            if (role == null || role.trim().isEmpty()) {
                logger.warn("Token validation failed: missing role");
                return false;
            }
            
            return true;
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            logger.warn("Token expired: {}", e.getMessage());
            return false;
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
            logger.warn("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    public String getRoleFromToken(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .getBody();
    }
}

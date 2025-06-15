package com.plagiguard.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendPasswordResetEmail(String to, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Password Reset Request");
            message.setText("""
                To reset your password, please click on this link:
                %s/reset-password?token=%s
                
                This link will expire in 1 hour.
                
                If you did not request this password reset, please ignore this email.
                """.formatted(frontendUrl, token));
            
            mailSender.send(message);
        } catch (MailException e) {
            throw new RuntimeException("Failed to send password reset email: " + e.getMessage(), e);
        }
    }
}

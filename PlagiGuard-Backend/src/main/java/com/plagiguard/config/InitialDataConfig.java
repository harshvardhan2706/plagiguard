package com.plagiguard.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.plagiguard.entity.Admin;
import com.plagiguard.repository.AdminRepository;

@Configuration
public class InitialDataConfig {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            // System.out.println("Checking for existing admin user...");
            // // Create default admin if not exists
            // if (!adminRepository.existsByUsername("admin")) {
            //     Admin admin = new Admin();
            //     admin.setUsername("admin");
            //     admin.setPassword(passwordEncoder.encode("admin123")); // Default password
            //     admin.setFullName("System Administrator");
            //     admin.setEmail("admin@plagiguard.com");
            //     admin.setRole("ADMIN");
            //     admin = adminRepository.save(admin);
            //     System.out.println("Default admin user created with id: " + admin.getId());
            // } else {
            //     System.out.println("Admin user already exists.");
            // }
        };
    }
}

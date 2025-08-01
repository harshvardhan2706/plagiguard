package com.plagiguard.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("https://plagiguard-backend.onrender.com/api/test")
public class TestController {
    
    @GetMapping("/auth")    public ResponseEntity<String> testAuth() {
        return ResponseEntity.ok("JWT authentication is working correctly!");
    }
}

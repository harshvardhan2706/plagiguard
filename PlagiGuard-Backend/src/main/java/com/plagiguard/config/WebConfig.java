package com.plagiguard.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "https://plagiguard.onrender.com"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders(
                    "Authorization",
                    "Content-Type",
                    "Accept",
                    "Accept-Language",
                    "Origin",
                    "X-Requested-With",
                    "Access-Control-Request-Method",
                    "Access-Control-Request-Headers"
                )
                .exposedHeaders("Authorization", "Access-Control-Allow-Origin")
                .allowCredentials(true)
                .maxAge(3600L);
    }
}

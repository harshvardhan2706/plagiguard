package com.plagiguard.controller;

import java.sql.Connection;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DBCheckController {
    private static final Logger logger = LoggerFactory.getLogger(DBCheckController.class);

    @Autowired
    private DataSource dataSource;

    @GetMapping("/check-db")
    public String checkDatabaseConnection() {
        try (Connection connection = dataSource.getConnection()) {
            boolean isValid = connection != null && !connection.isClosed() && connection.isValid(5);
            if (isValid) {
                logger.info("Database connection test successful");
                return "✅ Database connection is working.";
            }
            logger.warn("Database connection test failed - connection is invalid");
            return "❌ Database connection test failed: Connection validation failed";
        } catch (Exception e) {
            logger.error("Database connection test failed", e);
            return "❌ Database connection failed: " + e.getMessage();
        }
    }
}

package com.plagiguard.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class AIDetectorService {
    private static final Logger LOGGER = LoggerFactory.getLogger(AIDetectorService.class);
      @Value("${ai.detector.path:PlagiGuard-Backend/py/ai_detector}")
    private String aiDetectorPath;
    
    @Value("${ai.detector.startup.timeout.seconds:30}")
    private int startupTimeoutSeconds;
    
    @Value("${ai.detector.restart.max.attempts:3}")
    private int maxRestartAttempts;
    
    @Value("${ai.detector.restart.delay.seconds:5}")
    private int restartDelaySeconds;
    
    private Process aiProcess;
    private boolean isRunning = false;
    private AtomicInteger failedRestartAttempts = new AtomicInteger(0);

    @PostConstruct
    public void startAIDetector() {
        try {            Path projectRoot = Paths.get(System.getProperty("user.dir"));
            Path aiPath = projectRoot.resolve(aiDetectorPath);
            
            LOGGER.info("Project root: {}", projectRoot.toAbsolutePath());
            LOGGER.info("AI detector path: {}", aiPath.toAbsolutePath());
            
            // Ensure directory exists
            if (!Files.exists(aiPath)) {
                throw new IOException("AI detector directory does not exist: " + aiPath);
            }
            
            // Detect OS and set appropriate Python command
            String pythonCommand = System.getProperty("os.name").toLowerCase().contains("win") 
                ? "python" : "python3";
            
            // Check if Python is installed and available
            try {
                ProcessBuilder checkPython = new ProcessBuilder(pythonCommand, "--version");
                checkPython.redirectErrorStream(true);
                Process pyCheck = checkPython.start();
                int exitCode = pyCheck.waitFor();
                if (exitCode != 0) {
                    throw new IOException("Python check failed with exit code: " + exitCode);
                }
            } catch (IOException e) {
                LOGGER.error("Python is not installed or not in PATH: {}", e.getMessage());
                throw new IOException("Python is not installed or not in PATH", e);
            }
                
            ProcessBuilder processBuilder = new ProcessBuilder(
                pythonCommand,
                "app.py"
            );
            
            // Set working directory to AI detector path
            processBuilder.directory(aiPath.toFile());
            
            // Redirect error stream to output stream
            processBuilder.redirectErrorStream(true);
            
            LOGGER.info("Starting AI Detector service at path: {}", aiPath);
            aiProcess = processBuilder.start();
            
            // Start a thread to log the output
            new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(aiProcess.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        LOGGER.info("AI Detector: {}", line);
                        if (line.contains("Running on")) {
                            isRunning = true;
                        }
                    }
                } catch (IOException e) {
                    LOGGER.error("Error reading AI detector output", e);
                } finally {
                    // If process exits, mark as not running
                    isRunning = false;
                }
            }, "ai-detector-output-monitor").start();
            
            // Wait for service to start
            int attempts = 0;
            while (!isRunning && attempts < startupTimeoutSeconds) {
                try {
                    Thread.sleep(1000);
                    attempts++;
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Interrupted while waiting for AI detector to start", e);
                }
            }
            
            if (isRunning) {
                LOGGER.info("AI Detector service started successfully");
                failedRestartAttempts.set(0);
            } else {
                String error = "AI Detector service failed to start within " + startupTimeoutSeconds + " seconds";
                LOGGER.error(error);
                throw new RuntimeException(error);
            }
            
        } catch (Exception e) {
            LOGGER.error("Failed to start AI Detector service", e);
            handleStartupFailure();
        }
    }

    @PreDestroy
    public void stopAIDetector() {
        if (aiProcess != null && aiProcess.isAlive()) {
            LOGGER.info("Stopping AI Detector service...");
            aiProcess.destroy();
            try {
                // Wait up to 5 seconds for graceful shutdown
                if (!aiProcess.waitFor(5, java.util.concurrent.TimeUnit.SECONDS)) {
                    LOGGER.warn("AI Detector service did not stop gracefully, forcing termination");
                    aiProcess.destroyForcibly();
                }
                LOGGER.info("AI Detector service stopped successfully");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                LOGGER.error("Error stopping AI Detector service", e);
            }
        }
        isRunning = false;
    }
    
    @Scheduled(fixedDelayString = "${ai.detector.health.check.interval.seconds:60}000")
    public void healthCheck() {
        if (!isHealthy()) {
            LOGGER.warn("AI Detector service is unhealthy, attempting restart");
            restart();
        }
    }
    
    public boolean isHealthy() {
        return isRunning && aiProcess != null && aiProcess.isAlive();
    }
    
    public void restart() {
        LOGGER.info("Restarting AI Detector service...");
        stopAIDetector();
        startAIDetector();
    }
    
    private void handleStartupFailure() {
        int attempts = failedRestartAttempts.incrementAndGet();
        if (attempts < maxRestartAttempts) {
            LOGGER.info("Attempt {} of {} failed, retrying in {} seconds...", 
                attempts, maxRestartAttempts, restartDelaySeconds);
            try {
                Thread.sleep(restartDelaySeconds * 1000L);
                startAIDetector();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                LOGGER.error("Interrupted while waiting to retry", e);
            }
        } else {
            String error = "Failed to start AI Detector service after " + maxRestartAttempts + " attempts";
            LOGGER.error(error);
            throw new RuntimeException(error);
        }
    }
}

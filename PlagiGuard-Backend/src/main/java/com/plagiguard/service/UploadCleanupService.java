package com.plagiguard.service;

import com.plagiguard.repository.UploadRepository;
import com.plagiguard.entity.Upload;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UploadCleanupService {
    @Autowired
    private UploadRepository uploadRepository;

    // Runs every day at 2:00 AM
    @Scheduled(cron = "0 0 2 * * *")
    public void deleteOldUploads() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        List<Upload> oldUploads = uploadRepository.findByUploadDateBefore(cutoff);
        if (!oldUploads.isEmpty()) {
            uploadRepository.deleteAll(oldUploads);
            System.out.println("Deleted " + oldUploads.size() + " uploads older than 7 days.");
        }
    }
}

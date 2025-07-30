package com.plagiguard.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.plagiguard.entity.Upload;
import com.plagiguard.entity.User;

@Repository
public interface UploadRepository extends JpaRepository<Upload, Long> {
    List<Upload> findByUser(User user);
    Upload findByUserAndFilename(User user, String filename);
    
    long countByUploadDateBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT AVG(u.similarityScore) FROM Upload u")
    Double findAverageAIScore();
    
    List<Upload> findByUploadDateBefore(LocalDateTime cutoff);
}

package com.plagiguard.controller;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.plagiguard.entity.Upload;
import com.plagiguard.entity.User;
import com.plagiguard.repository.UploadRepository;
import com.plagiguard.repository.UserRepository;

@RestController
@RequestMapping("https://plagiguard-backend.onrender.com/api/admin/analytics")
// @CrossOrigin(origins = {"http://localhost:3000"})
public class AnalyticsController {

    @Autowired
    private UploadRepository uploadRepository;

    @Autowired
    private UserRepository userRepository;    @GetMapping("")
    public ResponseEntity<?> getAnalytics() {
        try {
            System.out.println("Analytics endpoint called");
            Map<String, Object> analytics = new HashMap<>();

            // Get all documents and users
            List<Upload> allUploads = uploadRepository.findAll();
            List<User> allUsers = userRepository.findAll();

            // Document uploads by month
            List<Map<String, Object>> documentsByMonth = getDocumentsByMonth(allUploads);
            analytics.put("documentsByMonth", documentsByMonth);

            // User growth by month
            List<Map<String, Object>> userGrowth = getUserGrowth(allUsers);
            analytics.put("userGrowth", userGrowth);

            // AI score distribution
            List<Map<String, Object>> aiScoreDistribution = getAIScoreDistribution(allUploads);
            analytics.put("aiScoreDistribution", aiScoreDistribution);

            // Peak upload times
            List<Map<String, Object>> uploadTimes = getUploadTimes(allUploads);
            analytics.put("uploadTimes", uploadTimes);

            return ResponseEntity.ok(analytics);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to fetch analytics: " + e.getMessage()));
        }
    }

    private List<Map<String, Object>> getDocumentsByMonth(List<Upload> uploads) {
        Map<YearMonth, Long> uploadsByMonth = uploads.stream()
            .collect(Collectors.groupingBy(
                upload -> YearMonth.from(upload.getUploadDate()),
                Collectors.counting()
            ));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");
        
        return uploadsByMonth.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(entry -> {
                Map<String, Object> monthData = new HashMap<>();
                monthData.put("month", entry.getKey().format(formatter));
                monthData.put("count", entry.getValue());
                return monthData;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> getUserGrowth(List<User> users) {
        Map<YearMonth, Long> usersByMonth = users.stream()
            .collect(Collectors.groupingBy(
                user -> YearMonth.from(user.getLastLogin() != null ? user.getLastLogin() : LocalDateTime.now()),
                Collectors.counting()
            ));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");
        
        return usersByMonth.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(entry -> {
                Map<String, Object> monthData = new HashMap<>();
                monthData.put("month", entry.getKey().format(formatter));
                monthData.put("count", entry.getValue());
                return monthData;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> getAIScoreDistribution(List<Upload> uploads) {        List<Map<String, Object>> distribution = new ArrayList<>();
        int[] ranges = {0, 20, 40, 60, 80, 100};

        for (int i = 0; i < ranges.length - 1; i++) {
            int min = ranges[i];
            int max = ranges[i + 1];
            
            long count = uploads.stream()
                .filter(upload -> upload.getSimilarityScore() != null)
                .filter(upload -> {
                    double score = upload.getSimilarityScore() * 100;
                    return score >= min && score < max;
                })
                .count();

            double percentage = uploads.isEmpty() ? 0 : (count * 100.0) / uploads.size();

            Map<String, Object> range = new HashMap<>();
            range.put("range", min + "-" + max + "%");
            range.put("count", count);
            range.put("percentage", Math.round(percentage * 10.0) / 10.0);
            distribution.add(range);
        }

        return distribution;
    }

    private List<Map<String, Object>> getUploadTimes(List<Upload> uploads) {
        List<Map<String, Object>> times = new ArrayList<>();
        String[] periods = {"Morning (6AM-12PM)", "Afternoon (12PM-6PM)", "Evening (6PM-12AM)", "Night (12AM-6AM)"};
        int[] startHours = {6, 12, 18, 0};
        int[] endHours = {12, 18, 24, 6};

        for (int i = 0; i < periods.length; i++) {
            final int start = startHours[i];
            final int end = endHours[i];

            long count = uploads.stream()
                .filter(upload -> {
                    int hour = upload.getUploadDate().getHour();
                    if (start < end) {
                        return hour >= start && hour < end;
                    } else {
                        return hour >= start || hour < end;
                    }
                })
                .count();

            double avgScore = uploads.stream()
                .filter(upload -> {
                    int hour = upload.getUploadDate().getHour();
                    if (start < end) {
                        return hour >= start && hour < end;
                    } else {
                        return hour >= start || hour < end;
                    }
                })
                .mapToDouble(upload -> upload.getSimilarityScore() * 100)
                .average()
                .orElse(0.0);

            Map<String, Object> period = new HashMap<>();
            period.put("period", periods[i]);
            period.put("uploads", count);
            period.put("avgScore", Math.round(avgScore * 10.0) / 10.0);
            times.add(period);
        }

        return times;
    }
}

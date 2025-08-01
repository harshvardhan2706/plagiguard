package com.plagiguard.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.plagiguard.entity.User;
import com.plagiguard.repository.UserRepository;

@RestController
@RequestMapping("https://plagiguard-backend.onrender.com/api/admin/users")
// @CrossOrigin(origins = {"http://localhost:3000"})
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("")
    public ResponseEntity<?> getUsers(
            @RequestParam(required = false, defaultValue = "created_at") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortOrder,
            @RequestParam(required = false, defaultValue = "all") String status) {

        Sort sort = Sort.by(Direction.fromString(sortOrder), mapSortField(sortBy));

        List<User> users = userRepository.findAll(sort);

        if (!"all".equals(status)) {
            users = users.stream()
                    .filter(user -> status.equals(user.getStatus()))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Integer id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {
        
        String newStatus = request.get("status");
        if (newStatus == null || (!newStatus.equals("active") && !newStatus.equals("suspended"))) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Invalid status. Must be 'active' or 'suspended'"));
        }

        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        user.setStatus(newStatus);
        user = userRepository.save(user);

        return ResponseEntity.ok(user);
    }

    private String mapSortField(String field) {
        return switch (field) {
            case "full_name" -> "fullName";
            case "created_at" -> "id"; // Since we don't have created_at, we'll sort by ID
            default -> field;
        };
    }
}

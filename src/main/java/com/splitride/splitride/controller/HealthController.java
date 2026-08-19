package com.splitride.splitride.controller;

import com.splitride.splitride.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/api/health")
    public ResponseEntity<String> healthCheck() {
        long userCount = userRepository.count();
        return ResponseEntity.ok("OK - " + userCount + " users in DB");
    }
}
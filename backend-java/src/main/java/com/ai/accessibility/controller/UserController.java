package com.ai.accessibility.controller;

import com.ai.accessibility.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private AuthService authService;

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        if (authentication == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "error");
            err.put("message", "Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        String userId = (String) authentication.getPrincipal();
        Map<String, Object> response = authService.getCurrentUser(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody Map<String, Object> updates,
            Authentication authentication
    ) {
        if (authentication == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "error");
            err.put("message", "Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        String userId = (String) authentication.getPrincipal();
        Map<String, Object> response = authService.updateProfile(userId, updates);
        return ResponseEntity.ok(response);
    }
}

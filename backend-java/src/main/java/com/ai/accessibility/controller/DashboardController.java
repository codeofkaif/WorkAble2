package com.ai.accessibility.controller;

import com.ai.accessibility.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        if (authentication == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "error");
            err.put("message", "Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        String userId = (String) authentication.getPrincipal();
        Map<String, Object> data = dashboardService.getDashboardData(userId);
        return ResponseEntity.ok(data);
    }
}

package com.ai.accessibility.service;

import com.ai.accessibility.model.User;
import com.ai.accessibility.repository.UserRepository;
import com.ai.accessibility.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Auth Service - Matches Node.js auth routes behavior exactly
 */
@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * Register user - Matches POST /api/auth/register exactly
     */
    public Map<String, Object> register(Map<String, Object> request) {
        String name = (String) request.get("name");
        String email = (String) request.get("email");
        String password = (String) request.get("password");
        String disabilityType = (String) request.getOrDefault("disabilityType", "none");
        String phone = (String) request.get("phone");
        String role = (String) request.getOrDefault("role", "job_seeker");
        
        // Validate required fields
        if (name == null || email == null || password == null) {
            throw new IllegalArgumentException("Name, email, and password are required");
        }
        
        // Check if user already exists
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User already exists");
        }
        
        // Create new user
        User user = new User();
        user.setName(name);
        user.setEmail(email.toLowerCase());
        user.setPassword(passwordEncoder.encode(password));
        user.setDisabilityType(disabilityType);
        user.setPhone(phone);
        user.setRole(role);
        user.setIsActive(true);
        user.setCreatedAt(new Date());
        user.setUpdatedAt(new Date());
        
        user = userRepository.save(user);
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId());
        
        // Return response matching Node.js format exactly
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("token", token);
        
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        response.put("user", userData);
        
        return response;
    }
    
    /**
     * Login user - Matches POST /api/auth/login exactly
     */
    public Map<String, Object> login(Map<String, Object> request) {
        String email = (String) request.get("email");
        String password = (String) request.get("password");
        
        // Validate required fields
        if (email == null || password == null) {
            throw new IllegalArgumentException("Email and password are required");
        }
        
        // Find user
        Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase());
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        
        User user = userOpt.get();
        
        // Validate password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        
        // Check if user is active
        if (!user.isActive()) {
            throw new IllegalStateException("Account is inactive. Please contact support.");
        }
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId());
        
        // Return response matching Node.js format exactly
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("token", token);
        
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        response.put("user", userData);
        
        return response;
    }
    
    /**
     * Get current user - Matches GET /api/auth/me exactly
     */
    public Map<String, Object> getCurrentUser(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        
        User user = userOpt.get();
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", user);
        
        return response;
    }
}

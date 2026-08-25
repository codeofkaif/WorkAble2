package com.ai.accessibility.service;

import com.ai.accessibility.entity.UserEntity;
import com.ai.accessibility.repository.jpa.UserJpaRepository;
import com.ai.accessibility.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AuthService {

    @Autowired
    private UserJpaRepository userJpaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // Temporary in-memory OTP cache for demo/reset
    private final Map<String, String> otpStore = new HashMap<>();

    public Map<String, Object> register(Map<String, Object> request) {
        String name = (String) request.get("name");
        String email = (String) request.get("email");
        String password = (String) request.get("password");
        String disabilityType = (String) request.getOrDefault("disabilityType", "none");
        String phone = (String) request.get("phone");
        String role = (String) request.getOrDefault("role", "job_seeker");

        if (name == null || email == null || password == null) {
            throw new IllegalArgumentException("Name, email, and password are required");
        }

        if (userJpaRepository.existsByEmail(email.toLowerCase())) {
            throw new IllegalArgumentException("User already exists");
        }

        UserEntity user = new UserEntity();
        user.setName(name);
        user.setEmail(email.toLowerCase());
        user.setPassword(passwordEncoder.encode(password));
        user.setDisabilityType(disabilityType);
        user.setPhone(phone);
        user.setRole(role);
        user.setIsActive(true);

        user = userJpaRepository.save(user);

        String token = jwtUtil.generateToken(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("token", token);

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        userData.put("role", user.getRole());
        response.put("user", userData);

        return response;
    }

    public Map<String, Object> login(Map<String, Object> request) {
        String email = (String) request.get("email");
        String password = (String) request.get("password");

        if (email == null || password == null) {
            throw new IllegalArgumentException("Email and password are required");
        }

        Optional<UserEntity> userOpt = userJpaRepository.findByEmail(email.toLowerCase());
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        UserEntity user = userOpt.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        if (!user.isActive()) {
            throw new IllegalStateException("Account is inactive. Please contact support.");
        }

        String token = jwtUtil.generateToken(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("token", token);

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        userData.put("role", user.getRole());
        response.put("user", userData);

        return response;
    }

    public Map<String, Object> getCurrentUser(String userId) {
        Optional<UserEntity> userOpt = userJpaRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        UserEntity user = userOpt.get();

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        
        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("_id", user.getId());
        data.put("name", user.getName());
        data.put("email", user.getEmail());
        data.put("phone", user.getPhone());
        data.put("role", user.getRole());
        data.put("headline", user.getHeadline());
        data.put("summary", user.getSummary());
        data.put("location", user.getLocation());
        data.put("disabilityType", user.getDisabilityType());
        data.put("skills", user.getSkills() != null ? user.getSkills() : Collections.emptyList());
        data.put("avatar", user.getAvatar());
        data.put("profileCompleted", user.isProfileCompleted());

        response.put("data", data);
        return response;
    }

    public Map<String, Object> updateProfile(String userId, Map<String, Object> updates) {
        Optional<UserEntity> userOpt = userJpaRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        UserEntity user = userOpt.get();
        if (updates.containsKey("name")) user.setName((String) updates.get("name"));
        if (updates.containsKey("headline")) user.setHeadline((String) updates.get("headline"));
        if (updates.containsKey("summary")) user.setSummary((String) updates.get("summary"));
        if (updates.containsKey("location")) user.setLocation((String) updates.get("location"));
        if (updates.containsKey("phone")) user.setPhone((String) updates.get("phone"));
        if (updates.containsKey("disabilityType")) user.setDisabilityType((String) updates.get("disabilityType"));
        if (updates.containsKey("avatar")) user.setAvatar((String) updates.get("avatar"));
        if (updates.containsKey("skills")) {
            Object skillsObj = updates.get("skills");
            if (skillsObj instanceof List) {
                user.setSkills((List<String>) skillsObj);
            }
        }

        userJpaRepository.save(user);
        return getCurrentUser(userId);
    }

    public Map<String, Object> forgotPassword(String email) {
        Optional<UserEntity> userOpt = userJpaRepository.findByEmail(email.toLowerCase());
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("No account with that email address exists");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStore.put(email.toLowerCase(), otp);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "OTP sent successfully");
        response.put("demoOtp", otp); // Provided for viva/testing demonstration
        return response;
    }

    public Map<String, Object> verifyOtpAndReset(String email, String otp, String newPassword) {
        String stored = otpStore.get(email.toLowerCase());
        if (stored == null || !stored.equals(otp)) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

        Optional<UserEntity> userOpt = userJpaRepository.findByEmail(email.toLowerCase());
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        UserEntity user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userJpaRepository.save(user);
        otpStore.remove(email.toLowerCase());

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Password reset successfully");
        return response;
    }
}

package com.ai.accessibility.user;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    public AuthController(@org.springframework.lang.Nullable UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        String email = (String) body.get("email");
        String password = (String) body.get("password");
        if (email == null || password == null || name == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
        }
        if (userRepository != null && userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(400).body(Map.of("message", "User already exists"));
        }
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        if (userRepository != null) {
            userRepository.save(user);
        }

        String token = Jwts.builder()
                .claim("user", Map.of("id", user.getId()))
                .setIssuedAt(new Date())
                .setExpiration(Date.from(Instant.now().plusSeconds(24 * 60 * 60)))
                .signWith(SignatureAlgorithm.HS256, jwtSecret.getBytes())
                .compact();
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        String password = (String) body.get("password");
        if (userRepository == null) {
            return ResponseEntity.status(503).body(Map.of("message", "MongoDB not configured"));
        }
        return userRepository.findByEmail(email)
                .filter(u -> passwordEncoder.matches(password, u.getPassword()))
                .<ResponseEntity<?>>map(u -> {
                    String token = Jwts.builder()
                            .claim("user", Map.of("id", u.getId()))
                            .setIssuedAt(new Date())
                            .setExpiration(Date.from(Instant.now().plusSeconds(24 * 60 * 60)))
                            .signWith(SignatureAlgorithm.HS256, jwtSecret.getBytes())
                            .compact();
                    return ResponseEntity.ok(Map.of("token", token));
                })
                .orElseGet(() -> ResponseEntity.status(400).body(Map.of("message", "Invalid credentials")));
    }
}



package com.ai.accessibility.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

/**
 * JWT Authentication Filter - Matches Node.js auth middleware behavior
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Override
    protected void doFilterInternal(
            @org.springframework.lang.NonNull HttpServletRequest request,
            @org.springframework.lang.NonNull HttpServletResponse response,
            @org.springframework.lang.NonNull FilterChain chain)
            throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        final String requestPath = request.getRequestURI();
        
        String userId = null;
        String jwt = null;
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            logger.debug("JWT token received for path: {}", requestPath);
            
            try {
                // Check if token is expired first
                if (jwtUtil.isTokenExpired(jwt)) {
                    logger.warn("JWT token is expired for path: {}", requestPath);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"status\":\"error\",\"message\":\"Token expired\"}");
                    return;
                }
                
                userId = jwtUtil.extractUserId(jwt);
                logger.debug("JWT token validated successfully. UserId: {}", userId);
                
            } catch (io.jsonwebtoken.ExpiredJwtException e) {
                logger.warn("JWT token expired: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"status\":\"error\",\"message\":\"Token expired\"}");
                return;
            } catch (io.jsonwebtoken.security.SignatureException e) {
                logger.error("JWT signature validation failed: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"status\":\"error\",\"message\":\"Invalid token signature\"}");
                return;
            } catch (io.jsonwebtoken.MalformedJwtException e) {
                logger.error("Malformed JWT token: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"status\":\"error\",\"message\":\"Invalid token format\"}");
                return;
            } catch (Exception e) {
                logger.error("JWT token validation failed for path {}: {}", requestPath, e.getMessage());
                logger.debug("JWT validation error details", e);
                // Don't return here - let it continue and Spring Security will handle 403
                // This allows public endpoints to work even with invalid tokens
            }
        } else {
            logger.debug("No Authorization header found for path: {}", requestPath);
        }
        
        if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Create authentication token
            UsernamePasswordAuthenticationToken authToken = 
                new UsernamePasswordAuthenticationToken(userId, null, new ArrayList<>());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
            logger.debug("Authentication set for userId: {}", userId);
        }
        
        chain.doFilter(request, response);
    }
}

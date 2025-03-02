package com.rayhanp1402.chip8_rom_server.controller;

import com.rayhanp1402.chip8_rom_server.model.UserProfile;
import com.rayhanp1402.chip8_rom_server.service.UserProfileService;
import com.rayhanp1402.chip8_rom_server.util.JwtUtil;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final UserProfileService userProfileService;
    private final JwtUtil jwtUtil;

    public AuthController(UserProfileService userProfileService, JwtUtil jwtUtil) {
        this.userProfileService = userProfileService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/me")
    public UserProfile getUserProfile(@RequestHeader("Authorization") String authHeader) {
        // Extract JWT token (Bearer <token>)
        String token = authHeader.replace("Bearer ", "");

        // Validate and extract user ID from Supabase JWT
        UUID userId = jwtUtil.extractUserId(token);

        // Fetch user profile from the database
        return userProfileService.getUserProfile(userId);
    }
}

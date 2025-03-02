package com.rayhanp1402.chip8_rom_server.service;

import com.rayhanp1402.chip8_rom_server.model.UserProfile;
import com.rayhanp1402.chip8_rom_server.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserProfileService {
    private final UserProfileRepository userProfileRepository;

    public UserProfileService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    public UserProfile processUserLogin(UUID userId, String name) {
        // Check if the user already exists
        Optional<UserProfile> existingUser = userProfileRepository.findById(userId);

        return existingUser.orElseGet(() ->
                userProfileRepository.save(new UserProfile(userId, name, false))
        );
    }

    public UserProfile getUserProfile(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

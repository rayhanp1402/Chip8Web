package com.rayhanp1402.chip8_rom_server.service;

import com.rayhanp1402.chip8_rom_server.model.User;
import com.rayhanp1402.chip8_rom_server.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User processGoogleLogin(Map<String, Object> attributes) {
        String googleId = attributes.get("sub").toString();
        String name = attributes.get("name").toString();

        return this.userRepository.findByGoogleId(googleId)
                .orElseGet(() -> this.userRepository.save(new User(googleId, name, false)));
    }
}

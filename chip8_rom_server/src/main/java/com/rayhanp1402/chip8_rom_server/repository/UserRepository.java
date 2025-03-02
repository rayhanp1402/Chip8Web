package com.rayhanp1402.chip8_rom_server.repository;

import com.rayhanp1402.chip8_rom_server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByGoogleId(String googleId);
}

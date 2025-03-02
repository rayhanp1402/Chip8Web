package com.rayhanp1402.chip8_rom_server.repository;

import com.rayhanp1402.chip8_rom_server.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> { }

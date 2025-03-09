package com.rayhanp1402.chip8_rom_server.repository;

import com.rayhanp1402.chip8_rom_server.model.Rom;
import com.rayhanp1402.chip8_rom_server.model.RomId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RomRepository extends JpaRepository<Rom, RomId> {
    List<Rom> findByIdUserId(UUID userId);

    List<Rom> findByIsPublic(boolean isPublic);
}

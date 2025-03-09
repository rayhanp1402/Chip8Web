package com.rayhanp1402.chip8_rom_server.service;

import com.rayhanp1402.chip8_rom_server.model.Rom;
import com.rayhanp1402.chip8_rom_server.repository.RomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class RomService {
    private final RomRepository romRepository;

    @Autowired
    public RomService(RomRepository romRepository) {
        this.romRepository = romRepository;
    }

    public List<Rom> getRomsByUserId(UUID userId) {
        return romRepository.findByIdUserId(userId);
    }

    public List<Rom> getPublicRoms(boolean isPublic) {
        return romRepository.findByIsPublic(isPublic);
    }
}

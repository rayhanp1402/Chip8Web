package com.rayhanp1402.chip8_rom_server.service;

import com.rayhanp1402.chip8_rom_server.model.Rom;
import com.rayhanp1402.chip8_rom_server.model.RomId;
import com.rayhanp1402.chip8_rom_server.repository.RomRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RomService {
    private final RomRepository romRepository;

    @Autowired
    public RomService(RomRepository romRepository) {
        this.romRepository = romRepository;
    }

    public List<Rom> getRomsByUserIdAndIsPublic(UUID userId, boolean isPublic) {
        return romRepository.findByIdUserIdAndIsPublic(userId, isPublic);
    }

    public List<Rom> getPublicRoms(boolean isPublic) {
        return romRepository.findByIsPublic(isPublic);
    }

    @Transactional
    public Rom saveRom(UUID userId, String romName, boolean isPublic) {
        if (!romName.toLowerCase().endsWith(".ch8")) {
            throw new IllegalArgumentException("Only .ch8 files are allowed");
        }

        RomId romId = new RomId(userId, romName);

        if (romRepository.existsById(romId)) {
            throw new IllegalArgumentException("A ROM with this name already exists.");
        }

        Rom rom = new Rom(romId, isPublic);
        return romRepository.save(rom);
    }

    public void deleteRom(UUID userId, String romName) {
        RomId romId = new RomId(userId, romName);
        Optional<Rom> romOptional = romRepository.findById(romId);

        if (romOptional.isEmpty()) {
            throw new IllegalArgumentException("ROM not found.");
        }

        Rom rom = romOptional.get();
        if (rom.isPublic()) {
            throw new IllegalArgumentException("Cannot delete publicly available ROM.");
        }

        romRepository.deleteById(romId);
    }
}

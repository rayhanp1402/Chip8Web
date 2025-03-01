package com.rayhanp1402.chip8_rom_server.service;

import com.rayhanp1402.chip8_rom_server.model.Rom;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class RomService {
    private List<Rom> roms = Arrays.asList(
            new Rom("IBM Logo.ch8", "rayhanp1402"),
            new Rom("Space Invaders.ch8", "rayhanp1402"),
            new Rom("Tetris.ch8", "rayhanp1402")
    );

    public List<String> listRoms() {
        return this.roms.stream()
                .map(Rom::getRomName)
                .toList();
    };
}

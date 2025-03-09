package com.rayhanp1402.chip8_rom_server.controller;

import com.rayhanp1402.chip8_rom_server.dto.RomRequest;
import com.rayhanp1402.chip8_rom_server.model.Rom;
import com.rayhanp1402.chip8_rom_server.service.RomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/rom")
public class RomController {
    private final RomService romService;

    @Autowired
    public RomController(RomService romService) {
        this.romService = romService;
    }

    @GetMapping("/public/list")
    public List<Rom> publicList() {
        return romService.getPublicRoms(true);
    }

    @GetMapping("/personal/list")
    public List<Rom> personalList(@RequestParam UUID userId) {
        return romService.getRomsByUserIdAndIsPublic(userId, false);
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveRom(@RequestBody RomRequest romRequest) {
        UUID userId = romRequest.getUserId();
        String romName = romRequest.getRomName();

        try {
            romService.saveRom(userId, romName, false);
            return ResponseEntity.ok("ROM saved successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

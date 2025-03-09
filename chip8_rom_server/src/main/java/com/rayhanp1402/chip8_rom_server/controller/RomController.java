package com.rayhanp1402.chip8_rom_server.controller;

import com.rayhanp1402.chip8_rom_server.dto.RomRequest;
import com.rayhanp1402.chip8_rom_server.model.Rom;
import com.rayhanp1402.chip8_rom_server.service.RomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URL;
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

    @GetMapping("/public/get")
    public ResponseEntity<?> getRomDownloadUrl(@RequestParam UUID userId, @RequestParam String romName) {
        try {
            URL downloadUrl = romService.getPublicRomDownloadUrl(userId, romName);
            return ResponseEntity.ok(downloadUrl.toString());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/personal/list")
    public List<Rom> personalList(@RequestParam UUID userId) {
        return romService.getRomsByUserIdAndIsPublic(userId, false);
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveRom(@RequestParam("userId") UUID userId,
                                     @RequestParam("romName") String romName,
                                     @RequestParam("file") MultipartFile file) {
        try {
            romService.saveRom(userId, romName, false, file);
            return ResponseEntity.ok("ROM saved successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteRoms(@RequestBody List<RomRequest> romRequests) {
        try {
            for (RomRequest romRequest : romRequests) {
                UUID userId = romRequest.getUserId();
                String romName = romRequest.getRomName();
                romService.deleteRom(userId, romName);
            }
            return ResponseEntity.ok("ROMs deleted successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

package com.rayhanp1402.chip8_rom_server.controller;

import com.rayhanp1402.chip8_rom_server.model.Rom;
import com.rayhanp1402.chip8_rom_server.service.RomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/rom")
public class RomController {
    private final RomService romService;

    @Autowired
    public RomController(RomService romService) {
        this.romService = romService;
    }

    @GetMapping("/public/list")
    public List<Rom> list() {
        return romService.getPublicRoms(true);
    }
}

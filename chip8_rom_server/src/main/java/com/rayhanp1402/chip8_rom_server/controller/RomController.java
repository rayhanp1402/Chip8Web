package com.rayhanp1402.chip8_rom_server.controller;

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
    @Autowired
    private RomService romService;

    @GetMapping("/list")
    public List<String> list() {
        return romService.listRoms();
    }
}

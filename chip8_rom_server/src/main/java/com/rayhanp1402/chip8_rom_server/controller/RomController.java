package com.rayhanp1402.chip8_rom_server.controller;

import com.rayhanp1402.chip8_rom_server.model.Rom;
import com.rayhanp1402.chip8_rom_server.service.RomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class RomController {
    @Autowired
    private RomService romService;

    @RequestMapping("/rom/list")
    public List<Rom> list() {
        return romService.listRoms();
    }
}

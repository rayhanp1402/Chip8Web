package com.rayhanp1402.chip8_rom_server.dto;

import java.util.UUID;

public class RomRequest {
    private UUID userId;
    private String romName;

    public RomRequest() {}

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getRomName() {
        return romName;
    }

    public void setRomName(String romName) {
        this.romName = romName;
    }
}

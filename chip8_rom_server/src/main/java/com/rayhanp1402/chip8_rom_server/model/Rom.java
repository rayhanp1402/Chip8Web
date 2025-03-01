package com.rayhanp1402.chip8_rom_server.model;

import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@NoArgsConstructor
public class Rom {
    private String romName;
    private String uploader;

    public Rom(String romName, String uploader) {
        this.romName = romName;
        this.uploader = uploader;
    }

    public String getRomName() {
        return romName;
    }

    public void setRomName(String romName) {
        this.romName = romName;
    }

    public String getUploader() {
        return uploader;
    }

    public void setUploader(String uploader) {
        this.uploader = uploader;
    }
}

package com.rayhanp1402.chip8_rom_server.model;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "roms")
public class Rom {
    @EmbeddedId
    private RomId id;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic;

    public Rom() {}

    public Rom(RomId id, boolean isPublic) {
        this.id = id;
        this.isPublic = isPublic;
    }

    public RomId getId() {
        return id;
    }

    public void setId(RomId id) {
        this.id = id;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean aPublic) {
        isPublic = aPublic;
    }
}

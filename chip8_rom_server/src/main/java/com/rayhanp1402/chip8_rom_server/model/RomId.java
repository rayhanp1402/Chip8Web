package com.rayhanp1402.chip8_rom_server.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class RomId implements Serializable {
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "rom_name")
    private String romName;

    public RomId() {}

    public RomId(UUID userId, String romName) {
        this.userId = userId;
        this.romName = romName;
    }

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

    @Override
    public boolean equals(Object o) {
        // Check if the current object is being compared to itself
        if (this == o) return true;

        // Check if the object is null or of a different class
        if (o == null || getClass() != o.getClass()) return false;

        // Cast the object to RomId and compare field values
        RomId romId = (RomId) o;
        return Objects.equals(userId, romId.userId) &&
                Objects.equals(romName, romId.romName);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, romName);
    }
}

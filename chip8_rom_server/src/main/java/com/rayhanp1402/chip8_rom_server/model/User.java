package com.rayhanp1402.chip8_rom_server.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@Table(name = "user")
public class User {
    @Id
    private String googleId; // Unique Google ID for each user

    private String name;

    private boolean admin;

    public User(String googleId, String name, boolean admin) {
        this.googleId = googleId;
        this.name = name;
        this.admin = admin;
    }

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isAdmin() {
        return admin;
    }

    public void setAdmin(boolean admin) {
        this.admin = admin;
    }
}

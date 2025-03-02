package com.rayhanp1402.chip8_rom_server.util;

import io.github.cdimascio.dotenv.Dotenv;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Component
public class JwtUtil {
    private final SecretKey key;
    private final JwtParser jwtParser;

    public JwtUtil() {
        String supabaseJwtSecret = Dotenv.load().get("SUPABASE_JWT_SECRET");

        if (supabaseJwtSecret == null || supabaseJwtSecret.length() < 32) {
            throw new IllegalStateException("Invalid or missing SUPABASE_JWT_SECRET. It must be at least 32 characters.");
        }

        this.key = Keys.hmacShaKeyFor(supabaseJwtSecret.getBytes(StandardCharsets.UTF_8));

        this.jwtParser = Jwts.parser().verifyWith(key).build();
    }

    public UUID extractUserId(String token) {
        try {
            Claims claims = jwtParser.parseSignedClaims(token).getPayload();
            return UUID.fromString(claims.getSubject());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid or expired JWT token", e);
        }
    }

}
package com.rayhanp1402.chip8_rom_server.service;

import com.rayhanp1402.chip8_rom_server.model.Rom;
import com.rayhanp1402.chip8_rom_server.model.RomId;
import com.rayhanp1402.chip8_rom_server.repository.RomRepository;
import io.github.cdimascio.dotenv.Dotenv;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.*;

@Service
public class RomService {
    private final RomRepository romRepository;
    private final S3Client s3Client;

    @Autowired
    public RomService(RomRepository romRepository, S3Client s3Client) {
        this.romRepository = romRepository;
        this.s3Client = s3Client;
    }

    public List<Rom> getRomsByUserIdAndIsPublic(UUID userId, boolean isPublic) {
        return romRepository.findByIdUserIdAndIsPublic(userId, isPublic);
    }

    public List<Rom> getPublicRoms(boolean isPublic) {
        return romRepository.findByIsPublic(isPublic);
    }

    @Transactional
    public Rom saveRom(UUID userId, String romName, boolean isPublic, MultipartFile file) {
        if (!romName.toLowerCase().endsWith(".ch8")) {
            throw new IllegalArgumentException("Only .ch8 files are allowed");
        }

        RomId romId = new RomId(userId, romName);

        if (romRepository.existsById(romId)) {
            throw new IllegalArgumentException("A ROM with this name already exists.");
        }
        String objectKey = userId + "/" + romName;

        // Upload file to S3
        try {
            Map<String, String> metadata = new HashMap<>();
            metadata.put("Content-Type", "application/octet-stream");
            metadata.put("Content-Length", String.valueOf(file.getSize()));

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(Dotenv.load().get("AWS_BUCKET_NAME"))
                    .key(objectKey)
                    .metadata(metadata)
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException e) {
            throw new RuntimeException("Error uploading file to S3", e);
        }

        // Save to database
        Rom rom = new Rom(romId, isPublic);
        return romRepository.save(rom);
    }

    public void deleteRom(UUID userId, String romName) {
        RomId romId = new RomId(userId, romName);
        Optional<Rom> romOptional = romRepository.findById(romId);

        if (romOptional.isEmpty()) {
            throw new IllegalArgumentException("ROM not found.");
        }

        Rom rom = romOptional.get();
        if (rom.isPublic()) {
            throw new IllegalArgumentException("Cannot delete publicly available ROM.");
        }

        romRepository.deleteById(romId);
    }
}

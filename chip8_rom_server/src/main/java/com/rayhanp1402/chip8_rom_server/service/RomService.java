package com.rayhanp1402.chip8_rom_server.service;

import com.rayhanp1402.chip8_rom_server.model.Rom;
import com.rayhanp1402.chip8_rom_server.model.RomId;
import com.rayhanp1402.chip8_rom_server.repository.RomRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.*;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.net.URL;
import java.time.Duration;
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
                    .bucket(System.getenv("AWS_BUCKET_NAME"))
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
        String objectKey = userId + "/" + romName;

        // Delete from S3
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(System.getenv("AWS_BUCKET_NAME"))
                    .key(objectKey)
                    .build());
        } catch (S3Exception e) {
            throw new RuntimeException("Error deleting file from S3", e);
        }

        // Delete from database
        romRepository.deleteById(romId);
    }

    public URL getPublicRomDownloadUrl(UUID userId, String romName) {
        // Check in the database first
        RomId romId = new RomId(userId, romName);
        Optional<Rom> romOptional = romRepository.findById(romId);

        if (romOptional.isEmpty()) {
            throw new IllegalArgumentException("ROM not found.");
        }

        Rom rom = romOptional.get();

        // Check if the ROM is public
        if (!rom.isPublic()) {
            throw new IllegalArgumentException("Access denied. This ROM is private.");
        }

        // Generate pre-signed URL
        String objectKey = userId + "/" + romName;

        AwsCredentialsProvider credentialsProvider = StaticCredentialsProvider.create(AwsBasicCredentials.create(
                System.getenv("AWS_ACCESS_KEY_ID"),
                System.getenv("AWS_SECRET_ACCESS_KEY")
        ));

        try (S3Presigner presigner = S3Presigner.builder()
                .credentialsProvider(credentialsProvider)
                .region(Region.of(System.getenv("AWS_REGION")))
                .build()) {

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(System.getenv("AWS_BUCKET_NAME"))
                    .key(objectKey)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(10))
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);

            return presignedRequest.url();
        } catch (S3Exception e) {
            throw new RuntimeException("Error generating download URL", e);
        }
    }

    public URL getPersonalRomDownloadUrl(UUID userId, String romName) {
        // Check in the database first
        RomId romId = new RomId(userId, romName);
        Optional<Rom> romOptional = romRepository.findById(romId);

        if (romOptional.isEmpty()) {
            throw new IllegalArgumentException("ROM not found.");
        }

        Rom rom = romOptional.get();

        // Generate pre-signed URL
        String objectKey = userId + "/" + romName;

        AwsCredentialsProvider credentialsProvider = StaticCredentialsProvider.create(AwsBasicCredentials.create(
                System.getenv("AWS_ACCESS_KEY_ID"),
                System.getenv("AWS_SECRET_ACCESS_KEY")
        ));

        try (S3Presigner presigner = S3Presigner.builder()
                .credentialsProvider(credentialsProvider)
                .region(Region.of(System.getenv("AWS_REGION")))
                .build()) {

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(System.getenv("AWS_BUCKET_NAME"))
                    .key(objectKey)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(10))
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);

            return presignedRequest.url();
        } catch (S3Exception e) {
            throw new RuntimeException("Error generating download URL", e);
        }
    }
}

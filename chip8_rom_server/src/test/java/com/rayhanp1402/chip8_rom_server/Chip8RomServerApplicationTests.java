package com.rayhanp1402.chip8_rom_server;

import com.rayhanp1402.chip8_rom_server.model.Rom;
import com.rayhanp1402.chip8_rom_server.model.RomId;
import com.rayhanp1402.chip8_rom_server.repository.RomRepository;
import com.rayhanp1402.chip8_rom_server.service.RomService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class Chip8RomServerApplicationTests {
    @InjectMocks
    private RomService romService;

    @Mock
    private RomRepository romRepository;

    @Mock
    private S3Client s3Client;

    @Mock
    private MultipartFile file;

    @Mock
    private Rom rom;

    private UUID userId;
    private String romName;
    private RomId romId;
    private byte[] fileContent;

    @BeforeEach
    void setup() {
        this.userId = UUID.randomUUID();
        this.romName = "TestRom.ch8";
        this.romId = new RomId(userId, romName);
        this.fileContent = "Dummy content".getBytes();
    }

    private List<Rom> createExpectedRoms(UUID userId) {
        return List.of(
                new Rom(new RomId(userId, "Pong.ch8"), true),
                new Rom(new RomId(userId, "Space Invaders.ch8"), true),
                new Rom(new RomId(userId, "Tetris.ch8"), true)
        );
    }

    @Test
    public void getRomsByUserIdAndIsPublic() {
        boolean isPublic = true;

        List<Rom> expectedRoms = createExpectedRoms(userId);

        when(romRepository.findByIdUserIdAndIsPublic(userId, isPublic)).thenReturn(expectedRoms);

        List<Rom> actualRoms = romService.getRomsByUserIdAndIsPublic(userId, isPublic);

        assertEquals(expectedRoms, actualRoms);
        verify(romRepository, times(1)).findByIdUserIdAndIsPublic(userId, isPublic);
    }

    @Test
    public void getPublicRoms() {
        boolean isPublic = true;

        List<Rom> expectedRoms = createExpectedRoms(userId);

        when(romRepository.findByIsPublic(isPublic)).thenReturn(expectedRoms);

        List<Rom> actualRoms = romService.getPublicRoms(isPublic);

        assertEquals(expectedRoms, actualRoms);
        verify(romRepository, times(1)).findByIsPublic(isPublic);
    }

    @Test
    void shouldThrowErrorForInvalidFileExtension() {
        assertThrows(IllegalArgumentException.class, () -> {
            romService.saveRom(userId, "invalid.txt", true, file);
        });
    }

    @Test
    void shouldThrowErrorWhenRomAlreadyExists() {
        when(romRepository.existsById(romId)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> {
            romService.saveRom(userId, romName, true, file);
        });

        verify(romRepository, times(1)).existsById(romId);
    }

    @Test
    void shouldThrowErrorWhenS3UploadFails() throws IOException {
        when(file.getSize()).thenReturn((long) fileContent.length);
        when(file.getInputStream()).thenReturn(new ByteArrayInputStream(fileContent));
        when(romRepository.existsById(romId)).thenReturn(false);

        doThrow(new RuntimeException("S3 Upload Failed")).when(s3Client)
                .putObject(any(PutObjectRequest.class), any(RequestBody.class));

        assertThrows(RuntimeException.class, () -> {
            romService.saveRom(userId, romName, true, file);
        });

        verify(s3Client, times(1)).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void shouldSaveRomSuccessfully() throws IOException {
        // Mock MultipartFile
        when(file.getSize()).thenReturn((long) fileContent.length);
        when(file.getInputStream()).thenReturn(new ByteArrayInputStream(fileContent));

        // Mock repository
        when(romRepository.existsById(romId)).thenReturn(false);
        when(romRepository.save(any(Rom.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Invoke the service's method
        Rom savedRom = romService.saveRom(userId, romName, false, file);

        assertNotNull(savedRom);
        assertEquals(romId, savedRom.getId());
        assertFalse(savedRom.isPublic());

        verify(romRepository, times(1)).existsById(romId);
        verify(romRepository, times(1)).save(any(Rom.class));
        verify(s3Client, times(1)).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void shouldThrowErrorWhenRomNotFound() {
        when(romRepository.findById(romId)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> romService.deleteRom(userId, romName));

        verify(s3Client, never()).deleteObject(any(DeleteObjectRequest.class));
        verify(romRepository, never()).deleteById(any());
    }

    @Test
    void shouldThrowErrorWhenRomIsPublic() {
        when(romRepository.findById(romId)).thenReturn(Optional.of(rom));
        when(rom.isPublic()).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> romService.deleteRom(userId, romName));

        verify(s3Client, never()).deleteObject(any(DeleteObjectRequest.class));
        verify(romRepository, never()).deleteById(any());
    }

    @Test
    void shouldThrowErrorWhenS3DeletionFails() {
        when(romRepository.findById(romId)).thenReturn(Optional.of(rom));
        when(rom.isPublic()).thenReturn(false);

        S3Exception s3Exception = mock(S3Exception.class);
        doThrow(s3Exception).when(s3Client).deleteObject(any(DeleteObjectRequest.class));

        assertThrows(RuntimeException.class, () -> romService.deleteRom(userId, romName));

        verify(s3Client, times(1)).deleteObject(any(DeleteObjectRequest.class));
        verify(romRepository, never()).deleteById(any());
    }

    @Test
    void shouldDeleteRomSuccessfully() {
        when(romRepository.findById(romId)).thenReturn(Optional.of(rom));
        when(rom.isPublic()).thenReturn(false);

        assertDoesNotThrow(() -> romService.deleteRom(userId, romName));

        verify(s3Client, times(1)).deleteObject(any(DeleteObjectRequest.class));
        verify(romRepository, times(1)).deleteById(romId);
    }
}

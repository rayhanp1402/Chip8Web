package com.rayhanp1402.chip8_rom_server;

import com.rayhanp1402.chip8_rom_server.model.Rom;
import com.rayhanp1402.chip8_rom_server.model.RomId;
import com.rayhanp1402.chip8_rom_server.repository.RomRepository;
import com.rayhanp1402.chip8_rom_server.service.RomService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class Chip8RomServerApplicationTests {
    @InjectMocks
    private RomService romService;

    @Mock
    private RomRepository romRepository;

    @Test
    public void getRomsByUserIdAndIsPublic() {
        UUID userId = UUID.randomUUID();
        boolean isPublic = true;

        List<Rom> expectedRoms = Arrays.asList(
                new Rom(new RomId(userId, "Pong.ch8"), true),
                new Rom(new RomId(userId, "Space Invaders.ch8"), true),
                new Rom(new RomId(userId, "Tetris.ch8"), true)
        );

        when(romRepository.findByIdUserIdAndIsPublic(userId, isPublic)).thenReturn(expectedRoms);

        List<Rom> actualRoms = romService.getRomsByUserIdAndIsPublic(userId, isPublic);

        assertEquals(expectedRoms, actualRoms);
        verify(romRepository, times(1)).findByIdUserIdAndIsPublic(userId, isPublic);
    }
}

package com.rayhanp1402.chip8_rom_server;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Chip8RomServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(Chip8RomServerApplication.class, args);
	}
}

package com.rayhanp1402.chip8_rom_server;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Chip8RomServerApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.load();
		System.setProperty("SUPABASE_DB_URL", dotenv.get("SUPABASE_DB_URL"));
		System.setProperty("SUPABASE_DB_USER", dotenv.get("SUPABASE_DB_USER"));
		System.setProperty("SUPABASE_DB_PASSWORD", dotenv.get("SUPABASE_DB_PASSWORD"));

		SpringApplication.run(Chip8RomServerApplication.class, args);
	}

}

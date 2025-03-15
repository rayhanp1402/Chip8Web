package com.rayhanp1402.chip8_rom_server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class S3Config {
    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
                .region(Region.of(System.getenv("AWS_REGION"))) // Pastikan AWS_REGION sudah di-set
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }
}

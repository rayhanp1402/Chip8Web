package com.rayhanp1402.chip8_rom_server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class AwsConfiguration {
    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(System.getenv("AWS_REGION")))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(
                                System.getenv("AWS_ACCESS_KEY_ID"),
                                System.getenv("AWS_SECRET_ACCESS_KEY")
                        )
                ))
                .build();
    }
}

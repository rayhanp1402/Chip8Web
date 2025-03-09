package com.rayhanp1402.chip8_rom_server;

import io.github.cdimascio.dotenv.Dotenv;
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
                .region(Region.of(Dotenv.load().get("AWS_REGION")))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(
                                Dotenv.load().get("AWS_ACCESS_KEY_ID"),
                                Dotenv.load().get("AWS_SECRET_ACCESS_KEY")
                        )
                ))
                .build();
    }
}

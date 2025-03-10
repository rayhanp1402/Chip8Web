FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

COPY ./target/chip8_rom_server-0.0.1.jar app.jar

RUN mkdir -p /app/logs

# Multistage build
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/app.jar app.jar

RUN mkdir -p /app/logs

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
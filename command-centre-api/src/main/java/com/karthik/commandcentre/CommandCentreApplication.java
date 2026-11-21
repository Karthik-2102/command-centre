package com.karthik.commandcentre;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
public class CommandCentreApplication {
    public static void main(String[] args) {
        loadDotEnv();
        normalizeDatabaseUrl();
        SpringApplication.run(CommandCentreApplication.class, args);
    }

    private static void normalizeDatabaseUrl() {
        String dbUrl = System.getenv("DB_URL");
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = System.getProperty("DB_URL");
        }
        if (dbUrl != null && !dbUrl.isBlank()) {
            dbUrl = dbUrl.trim();
            // Handle postgres:// or postgresql:// (Render/Heroku native connection strings)
            if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
                try {
                    java.net.URI uri = new java.net.URI(dbUrl);
                    String userInfo = uri.getUserInfo();
                    if (userInfo != null && userInfo.contains(":")) {
                        String[] parts = userInfo.split(":", 2);
                        System.setProperty("spring.datasource.username", parts[0]);
                        System.setProperty("spring.datasource.password", parts[1]);
                    }
                    String host = uri.getHost();
                    int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                    String path = uri.getPath() != null && !uri.getPath().isEmpty() ? uri.getPath() : "/command_centre";
                    String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path + "?sslmode=require";
                    System.setProperty("spring.datasource.url", jdbcUrl);
                    System.setProperty("DB_URL", jdbcUrl);
                    System.out.println("[Environment] Normalized Render Database URL to: " + jdbcUrl);
                } catch (Exception e) {
                    System.err.println("[Environment] Could not parse DB_URL: " + e.getMessage());
                }
            } else if (dbUrl.startsWith("jdbc:postgresql://") && !dbUrl.contains("sslmode=")) {
                String sslUrl = dbUrl.contains("?") ? dbUrl + "&sslmode=require" : dbUrl + "?sslmode=require";
                System.setProperty("spring.datasource.url", sslUrl);
                System.setProperty("DB_URL", sslUrl);
            }
        }
    }

    private static void loadDotEnv() {
        File[] candidateFiles = {
            new File(".env"),
            new File("../.env"),
            new File("command-centre-api/.env")
        };

        for (File file : candidateFiles) {
            if (file.exists() && file.isFile()) {
                try {
                    List<String> lines = Files.readAllLines(file.toPath());
                    System.out.println("[Environment] Loaded environment variables from: " + file.getAbsolutePath());
                    for (String line : lines) {
                        String trimmed = line.trim();
                        if (!trimmed.isEmpty() && !trimmed.startsWith("#") && trimmed.contains("=")) {
                            int eqIdx = trimmed.indexOf('=');
                            String key = trimmed.substring(0, eqIdx).trim();
                            String value = trimmed.substring(eqIdx + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (!value.isEmpty()) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                    break;
                } catch (Exception ignored) {
                }
            }
        }
    }
}

package com.smarttrip.payment.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.AutoConfigureBefore;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.annotation.Configuration;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

@Slf4j
@Configuration
@AutoConfigureBefore(DataSourceAutoConfiguration.class)
public class DatabaseInitConfig {

    @Value("${DB_HOST:localhost}")
    private String host;

    @Value("${DB_PORT:1433}")
    private String port;

    @Value("${DB_USER:sa}")
    private String user;

    @Value("${DB_PASSWORD:SmartTrip@Pwd2026!}")
    private String password;

    @PostConstruct
    public void ensureDatabaseExists() {
        String masterUrl = String.format("jdbc:sqlserver://%s:%s;databaseName=master;encrypt=false;trustServerCertificate=true", host, port);
        try {
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
            try (Connection conn = DriverManager.getConnection(masterUrl, user, password);
                 Statement stmt = conn.createStatement()) {
                String checkAndCreate = "IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'smarttrip_payment_db') "
                        + "BEGIN "
                        + "    CREATE DATABASE [smarttrip_payment_db]; "
                        + "END";
                stmt.executeUpdate(checkAndCreate);
                log.info("Verified/Created SQL Server database 'smarttrip_payment_db' successfully");
            }
        } catch (Exception e) {
            log.warn("Database auto-check from master completed: {}", e.getMessage());
        }
    }
}

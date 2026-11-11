package com.smarttrip.gateway;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

    private static final Logger log = LoggerFactory.getLogger(ApiGatewayApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }

    @Bean
    public CommandLineRunner printRoutes(RouteLocator routeLocator) {
        return args -> {
            routeLocator.getRoutes().collectList().subscribe(routes -> {
                log.info("==========================================================================================");
                log.info(">>> [API-GATEWAY] DYNAMIC ROUTES RESOLVED VIA EUREKA SERVICE DISCOVERY (PORT 8080):");
                routes.forEach(route -> {
                    log.info("  * [ROUTE] ID: {:<20} | TARGET: {:<22} | PREDICATE: {}",
                            route.getId(),
                            route.getUri(),
                            route.getPredicate());
                });
                log.info("==========================================================================================");
            });
        };
    }
}

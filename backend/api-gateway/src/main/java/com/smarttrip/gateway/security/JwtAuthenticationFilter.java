package com.smarttrip.gateway.security;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtValidator jwtValidator;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/v1/auth/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/actuator/**",
            "/eureka/**"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        HttpMethod method = request.getMethod();

        // 1. Whitelist public endpoints
        if (isPublicEndpoint(path, method)) {
            return chain.filter(exchange);
        }

        // 2. Extract Authorization header
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing or invalid Authorization header for path: {}", path);
            return onError(exchange, HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7).trim();
        Claims claims;
        try {
            claims = jwtValidator.validateAndParse(token);
        } catch (Exception ex) {
            log.warn("Invalid JWT token for path {}: {}", path, ex.getMessage());
            return onError(exchange, HttpStatus.UNAUTHORIZED, "Invalid or expired JWT token: " + ex.getMessage());
        }

        List<String> roles = jwtValidator.extractRoles(claims);
        String userId = jwtValidator.extractUserId(claims);
        String email = claims.getSubject();

        // 3. Role-based authorization pre-check at Gateway
        if (!isAuthorized(path, roles)) {
            log.warn("Access denied for user {} with roles {} on path {}", userId, roles, path);
            return onError(exchange, HttpStatus.FORBIDDEN, "Access denied: insufficient permissions for this endpoint");
        }

        // 4. Mutate request headers to forward identity to downstream services
        ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-User-Id", userId != null ? userId : "")
                .header("X-User-Email", email != null ? email : "")
                .header("X-User-Roles", String.join(",", roles))
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private boolean isPublicEndpoint(String path, HttpMethod method) {
        // Public read-only paths for browsing
        if (method == HttpMethod.GET) {
            if (pathMatcher.match("/api/v1/tours/**", path) || pathMatcher.match("/api/v1/hotels/**", path)) {
                return true;
            }
        }

        // General public paths
        return PUBLIC_PATHS.stream().anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    private boolean isAuthorized(String path, List<String> roles) {
        // Admin endpoints: /api/v1/admin/** requires ROLE_ADMIN
        if (pathMatcher.match("/api/v1/admin/**", path)) {
            return roles.contains("ROLE_ADMIN");
        }

        // Tour Operator endpoints: /api/v1/operator/** requires ROLE_TOUR_OPERATOR or ROLE_ADMIN
        if (pathMatcher.match("/api/v1/operator/**", path)) {
            return roles.contains("ROLE_TOUR_OPERATOR") || roles.contains("ROLE_ADMIN");
        }

        // Hotel Manager endpoints: /api/v1/manager/** requires ROLE_HOTEL_MANAGER or ROLE_ADMIN
        if (pathMatcher.match("/api/v1/manager/**", path)) {
            return roles.contains("ROLE_HOTEL_MANAGER") || roles.contains("ROLE_ADMIN");
        }

        // Customer / Protected endpoints: /api/v1/bookings/**, /api/v1/wallet/**, /api/v1/users/**
        return true;
    }

    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus status, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String body = String.format("{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"%s\",\"message\":\"%s\",\"path\":\"%s\"}",
                Instant.now().toString(),
                status.value(),
                status.getReasonPhrase(),
                message,
                exchange.getRequest().getPath().value()
        );
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -100; // Execute early in filter chain
    }
}

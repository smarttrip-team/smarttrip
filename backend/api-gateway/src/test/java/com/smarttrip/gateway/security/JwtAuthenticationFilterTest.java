package com.smarttrip.gateway.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    private static final String SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private JwtValidator jwtValidator;
    private JwtAuthenticationFilter filter;
    private SecretKey key;

    @BeforeEach
    void setUp() {
        jwtValidator = new JwtValidator(SECRET);
        filter = new JwtAuthenticationFilter(jwtValidator);
        key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    private String generateTestToken(Long userId, String email, List<String> roles, long expirationOffsetMs) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationOffsetMs);
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    @Test
    void testPublicEndpoint_AuthLogin_AllowsWithoutToken() {
        MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/auth/login").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        filter.filter(exchange, chain).block();

        verify(chain, times(1)).filter(exchange);
        assertNull(exchange.getResponse().getStatusCode());
    }

    @Test
    void testPublicEndpoint_GetTours_AllowsWithoutToken() {
        MockServerHttpRequest request = MockServerHttpRequest.method(HttpMethod.GET, "/api/v1/tours").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        filter.filter(exchange, chain).block();

        verify(chain, times(1)).filter(exchange);
        assertNull(exchange.getResponse().getStatusCode());
    }

    @Test
    void testProtectedEndpoint_MissingAuthorizationHeader_Returns401() {
        MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/bookings").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        filter.filter(exchange, chain).block();

        verify(chain, never()).filter(any());
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    }

    @Test
    void testProtectedEndpoint_InvalidToken_Returns401() {
        MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/bookings")
                .header(HttpHeaders.AUTHORIZATION, "Bearer invalid-junk-token")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        filter.filter(exchange, chain).block();

        verify(chain, never()).filter(any());
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    }

    @Test
    void testProtectedEndpoint_ExpiredToken_Returns401() {
        String expiredToken = generateTestToken(1L, "user@test.com", List.of("ROLE_CUSTOMER"), -10000);
        MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/bookings")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + expiredToken)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        filter.filter(exchange, chain).block();

        verify(chain, never()).filter(any());
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    }

    @Test
    void testProtectedEndpoint_ValidCustomerToken_PropagatesHeaders() {
        String token = generateTestToken(100L, "customer@test.com", List.of("ROLE_CUSTOMER"), 3600000);
        MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/bookings")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        ArgumentCaptor<ServerWebExchange> captor = ArgumentCaptor.forClass(ServerWebExchange.class);
        when(chain.filter(captor.capture())).thenReturn(Mono.empty());

        filter.filter(exchange, chain).block();

        verify(chain, times(1)).filter(any());
        ServerWebExchange mutatedExchange = captor.getValue();
        assertEquals("100", mutatedExchange.getRequest().getHeaders().getFirst("X-User-Id"));
        assertEquals("customer@test.com", mutatedExchange.getRequest().getHeaders().getFirst("X-User-Email"));
        assertEquals("ROLE_CUSTOMER", mutatedExchange.getRequest().getHeaders().getFirst("X-User-Roles"));
    }

    @Test
    void testAdminEndpoint_CustomerRole_Returns403() {
        String token = generateTestToken(100L, "customer@test.com", List.of("ROLE_CUSTOMER"), 3600000);
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/admin/dashboard")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        filter.filter(exchange, chain).block();

        verify(chain, never()).filter(any());
        assertEquals(HttpStatus.FORBIDDEN, exchange.getResponse().getStatusCode());
    }

    @Test
    void testOperatorEndpoint_CustomerRole_Returns403() {
        String token = generateTestToken(100L, "customer@test.com", List.of("ROLE_CUSTOMER"), 3600000);
        MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/operator/tours")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        filter.filter(exchange, chain).block();

        verify(chain, never()).filter(any());
        assertEquals(HttpStatus.FORBIDDEN, exchange.getResponse().getStatusCode());
    }

    @Test
    void testOperatorEndpoint_OperatorRole_Success() {
        String token = generateTestToken(200L, "operator@test.com", List.of("ROLE_TOUR_OPERATOR"), 3600000);
        MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/operator/tours")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        filter.filter(exchange, chain).block();

        verify(chain, times(1)).filter(any());
        assertNull(exchange.getResponse().getStatusCode());
    }

    @Test
    void testAdminEndpoint_AdminRole_Success() {
        String token = generateTestToken(300L, "admin@test.com", List.of("ROLE_ADMIN"), 3600000);
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/admin/users")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        filter.filter(exchange, chain).block();

        verify(chain, times(1)).filter(any());
        assertNull(exchange.getResponse().getStatusCode());
    }
}

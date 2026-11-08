package com.smarttrip.user.controller;

import com.smarttrip.user.dto.UserStatusResponse;
import com.smarttrip.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/internal/v1/users")
@RequiredArgsConstructor
@Tag(name = "Internal User API", description = "Inter-service communication APIs")
public class InternalUserController {

    private final UserService userService;

    @GetMapping("/{id}/status")
    @Operation(summary = "Internal: Check user active status and roles")
    public ResponseEntity<UserStatusResponse> getUserStatus(@PathVariable("id") Long id) {
        return ResponseEntity.ok(userService.getUserStatus(id));
    }

    @GetMapping("/{id}/verify-role")
    @Operation(summary = "Internal: Verify if user has a specific role")
    public ResponseEntity<Map<String, Object>> verifyRole(
            @PathVariable("id") Long id,
            @RequestParam("role") String role) {
        boolean verified = userService.verifyUserRole(id, role);
        return ResponseEntity.ok(Map.of(
                "userId", id,
                "role", role,
                "verified", verified
        ));
    }
}

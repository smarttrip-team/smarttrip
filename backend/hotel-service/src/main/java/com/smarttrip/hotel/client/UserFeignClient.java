package com.smarttrip.hotel.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "user-service")
public interface UserFeignClient {

    @GetMapping("/internal/v1/users/{id}/verify-role")
    Map<String, Object> verifyRole(
            @PathVariable("id") Long id,
            @RequestParam("role") String role
    );
}

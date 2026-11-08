package com.smarttrip.booking.client;

import com.smarttrip.booking.client.dto.UserStatusDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service")
public interface UserFeignClient {

    @GetMapping("/internal/v1/users/{id}/status")
    UserStatusDto getUserStatus(@PathVariable("id") Long id);
}

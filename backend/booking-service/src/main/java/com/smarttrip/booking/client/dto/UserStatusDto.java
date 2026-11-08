package com.smarttrip.booking.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatusDto {
    private Long userId;
    private String email;
    private String status;
    private boolean active;
    private Set<String> roles;
}

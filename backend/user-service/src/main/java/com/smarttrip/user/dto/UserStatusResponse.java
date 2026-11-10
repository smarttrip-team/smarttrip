package com.smarttrip.user.dto;

import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatusResponse {
    private Long userId;
    private String email;
    private String status;
    private boolean active;
    private Set<String> roles;
}

package com.smarttrip.user.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String status;
    private Set<String> roles;
    private UserProfileResponse profile;
    private LocalDateTime createdAt;
}

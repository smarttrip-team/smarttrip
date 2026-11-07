package com.smarttrip.user.dto;

import lombok.*;
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
    private String fullName;
    private String phone;
    private Set<String> roles;
}

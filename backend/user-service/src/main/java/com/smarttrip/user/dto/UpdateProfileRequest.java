package com.smarttrip.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {
    @NotBlank(message = "Ho ten khong duoc de trong")
    private String fullName;
    private String phone;
    private String avatarUrl;
}

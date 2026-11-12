package com.smarttrip.hotel.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class HotelCreateRequest {

    @NotBlank(message = "Hotel name is required")
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    private String description;

    @Builder.Default
    private Long managerId = 2L;

    public Long getManagerId() {
        return managerId != null ? managerId : 2L;
    }
}

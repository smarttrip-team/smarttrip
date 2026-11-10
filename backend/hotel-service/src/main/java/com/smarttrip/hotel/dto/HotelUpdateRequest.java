package com.smarttrip.hotel.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelUpdateRequest {
    private String name;
    private String address;
    private String description;
    private String status;
}

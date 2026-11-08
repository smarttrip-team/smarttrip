package com.smarttrip.hotel.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomTypeAvailabilityResponse {
    private Long roomTypeId;
    private String roomTypeName;
    private Integer capacity;
    private BigDecimal basePrice;
    private Integer minAvailableRooms;
    private boolean available;
}

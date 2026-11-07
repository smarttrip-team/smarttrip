package com.smarttrip.hotel.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomTypeResponse {
    private Long id;
    private Long hotelId;
    private String name;
    private Integer capacity;
    private BigDecimal basePrice;
    private String status;
}

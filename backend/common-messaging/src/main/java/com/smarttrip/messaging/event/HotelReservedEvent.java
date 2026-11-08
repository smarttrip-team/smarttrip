package com.smarttrip.messaging.event;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelReservedEvent {
    private Long bookingId;
    private String bookingCode;
    private Long hotelId;
    private Long roomTypeId;
    private Integer roomQuantity;
    private BigDecimal price;
}

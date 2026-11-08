package com.smarttrip.messaging.event;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourReservedEvent {
    private Long bookingId;
    private String bookingCode;
    private Long reservationId;
    private Long tourId;
    private Long departureId;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}

package com.smarttrip.booking.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingItemResponse {
    private Long id;
    private Long tourId;
    private Long departureId;
    private String tourNameSnapshot;
    private LocalDate departureDateSnapshot;
    private BigDecimal unitPriceSnapshot;
    private Integer quantity;
    private BigDecimal subtotal;
}

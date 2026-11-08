package com.smarttrip.booking.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingHotelDetailResponse {
    private Long id;
    private Long hotelId;
    private String hotelNameSnapshot;
    private Long roomTypeId;
    private String roomNameSnapshot;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer roomQuantity;
    private BigDecimal priceSnapshot;
}

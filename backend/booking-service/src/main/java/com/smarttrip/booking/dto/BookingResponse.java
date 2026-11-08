package com.smarttrip.booking.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private Long customerId;
    private String status;
    private BigDecimal totalAmount;
    private String currency;
    private String idempotencyKey;

    @Builder.Default
    private List<BookingItemResponse> items = new ArrayList<>();

    @Builder.Default
    private List<BookingPassengerResponse> passengers = new ArrayList<>();

    @Builder.Default
    private List<BookingHotelDetailResponse> hotelDetails = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

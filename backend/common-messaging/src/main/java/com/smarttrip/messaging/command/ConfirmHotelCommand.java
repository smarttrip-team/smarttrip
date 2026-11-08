package com.smarttrip.messaging.command;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfirmHotelCommand {
    private Long bookingId;
    private String bookingCode;
    private Long hotelId;
    private Long roomTypeId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer roomQuantity;
}

package com.smarttrip.messaging.command;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReserveTourCommand {
    private Long bookingId;
    private String bookingCode;
    private Long tourId;
    private Long departureId;
    private Integer quantity;
}

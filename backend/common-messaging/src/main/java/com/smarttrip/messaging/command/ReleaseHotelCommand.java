package com.smarttrip.messaging.command;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReleaseHotelCommand {
    private Long bookingId;
    private String bookingCode;
    private Long hotelId;
    private Long roomTypeId;
    private Integer roomQuantity;
}

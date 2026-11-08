package com.smarttrip.messaging.event;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelReserveFailedEvent {
    private Long bookingId;
    private String bookingCode;
    private Long hotelId;
    private Long roomTypeId;
    private String reason;
}

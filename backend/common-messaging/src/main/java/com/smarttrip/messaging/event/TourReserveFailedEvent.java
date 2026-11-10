package com.smarttrip.messaging.event;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourReserveFailedEvent {
    private Long bookingId;
    private String bookingCode;
    private Long tourId;
    private Long departureId;
    private String reason;
}

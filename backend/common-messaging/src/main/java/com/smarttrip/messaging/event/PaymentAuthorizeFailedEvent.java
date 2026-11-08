package com.smarttrip.messaging.event;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentAuthorizeFailedEvent {
    private Long bookingId;
    private String bookingCode;
    private String reason;
}

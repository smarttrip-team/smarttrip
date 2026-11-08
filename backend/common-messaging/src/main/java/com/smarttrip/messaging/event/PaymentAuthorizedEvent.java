package com.smarttrip.messaging.event;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentAuthorizedEvent {
    private Long bookingId;
    private String bookingCode;
    private Long paymentId;
    private BigDecimal authorizedAmount;
}

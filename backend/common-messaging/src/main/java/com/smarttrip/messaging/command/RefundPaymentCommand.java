package com.smarttrip.messaging.command;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundPaymentCommand {
    private Long bookingId;
    private String bookingCode;
    private Long userId;
    private BigDecimal amount;
    private String reason;
}

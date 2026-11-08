package com.smarttrip.messaging.command;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoidPaymentCommand {
    private Long bookingId;
    private String bookingCode;
    private Long userId;
    private BigDecimal amount;
}

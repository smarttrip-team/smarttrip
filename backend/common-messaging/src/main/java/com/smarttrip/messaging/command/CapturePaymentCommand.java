package com.smarttrip.messaging.command;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CapturePaymentCommand {
    private Long bookingId;
    private String bookingCode;
    private Long userId;
    private BigDecimal amount;

    // Multi-party Revenue Settlement Fields (10% Platform Fee)
    private Long operatorId;
    private BigDecimal tourAmount;
    private Long hotelierId;
    private BigDecimal hotelAmount;
}

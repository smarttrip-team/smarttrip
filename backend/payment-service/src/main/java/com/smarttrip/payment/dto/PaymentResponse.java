package com.smarttrip.payment.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private Long id;
    private String bookingId;
    private BigDecimal amount;
    private String currency;
    private String status;
}

package com.smarttrip.payment.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {
    private Long id;
    private Long walletId;
    private String transactionType;
    private BigDecimal amount;
    private String referenceType;
    private String referenceId;
    private String idempotencyKey;
    private LocalDateTime createdAt;
}

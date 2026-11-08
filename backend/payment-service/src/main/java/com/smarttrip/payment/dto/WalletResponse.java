package com.smarttrip.payment.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletResponse {
    private Long id;
    private Long userId;
    private BigDecimal balance;
    private BigDecimal heldAmount;
    private BigDecimal availableBalance;
    private String currency;
    private String status;
}

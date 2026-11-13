package com.smarttrip.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawRequest {

    private Long userId;

    @NotNull(message = "amount is required")
    @DecimalMin(value = "0.01", message = "Withdraw amount must be greater than zero")
    private BigDecimal amount;

    private String bankName;

    private String accountNumber;

    private String beneficiaryName;

    private String idempotencyKey;
}

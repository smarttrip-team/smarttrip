package com.smarttrip.payment.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class TopUpRequest {

    private Long userId;

    @NotNull(message = "amount is required")
    @DecimalMin(value = "0.01", message = "Top-up amount must be greater than zero")
    private BigDecimal amount;

    private String idempotencyKey;

    private String paymentMethod;
}

package com.smarttrip.booking.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SagaStepResponse {
    private String stepName;
    private String actionType;
    private String status;
    private Integer attemptCount;
    private String lastError;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}

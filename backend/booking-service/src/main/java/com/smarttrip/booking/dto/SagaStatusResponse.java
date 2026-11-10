package com.smarttrip.booking.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SagaStatusResponse {
    private String sagaId;
    private Long bookingId;
    private String bookingCode;
    private String sagaType;
    private String status;
    private String currentStep;
    private String failureReason;
    @Builder.Default
    private List<SagaStepResponse> steps = new ArrayList<>();
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}

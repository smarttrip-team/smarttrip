package com.smarttrip.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "saga_instances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SagaInstance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "saga_id", nullable = false, unique = true, length = 100)
    private String sagaId;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "saga_type", nullable = false, length = 50)
    private String sagaType;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "STARTED";

    @Column(name = "current_step", length = 50)
    private String currentStep;

    @Version
    @Column(nullable = false)
    @Builder.Default
    private Long version = 0L;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @OneToMany(mappedBy = "sagaInstance", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<SagaStep> steps = new ArrayList<>();

    @Column(name = "started_at", insertable = false, updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}

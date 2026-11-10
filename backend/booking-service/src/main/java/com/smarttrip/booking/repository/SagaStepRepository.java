package com.smarttrip.booking.repository;

import com.smarttrip.booking.entity.SagaStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SagaStepRepository extends JpaRepository<SagaStep, Long> {
    List<SagaStep> findBySagaInstanceSagaId(String sagaId);
    Optional<SagaStep> findBySagaInstanceSagaIdAndStepName(String sagaId, String stepName);
    List<SagaStep> findBySagaInstanceBookingId(Long bookingId);
}

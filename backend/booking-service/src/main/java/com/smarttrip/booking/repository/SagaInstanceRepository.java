package com.smarttrip.booking.repository;

import com.smarttrip.booking.entity.SagaInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SagaInstanceRepository extends JpaRepository<SagaInstance, Long> {
    Optional<SagaInstance> findBySagaId(String sagaId);
    Optional<SagaInstance> findTopByBookingIdOrderByIdDesc(Long bookingId);
    Optional<SagaInstance> findByBookingId(Long bookingId);
    List<SagaInstance> findByStatus(String status);
}

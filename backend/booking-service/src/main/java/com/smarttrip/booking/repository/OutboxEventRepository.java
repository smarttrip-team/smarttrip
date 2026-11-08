package com.smarttrip.booking.repository;

import com.smarttrip.booking.entity.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, Long> {
    List<OutboxEvent> findByStatusOrderByCreatedAtAsc(String status);
    List<OutboxEvent> findByAggregateId(String aggregateId);
}

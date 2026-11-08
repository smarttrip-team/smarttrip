package com.smarttrip.booking.repository;

import com.smarttrip.booking.entity.ProcessedMessage;
import com.smarttrip.booking.entity.ProcessedMessageId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessedMessageRepository extends JpaRepository<ProcessedMessage, ProcessedMessageId> {
    boolean existsByMessageIdAndConsumerName(String messageId, String consumerName);
}

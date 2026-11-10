package com.smarttrip.payment.repository;

import com.smarttrip.payment.entity.ProcessedMessage;
import com.smarttrip.payment.entity.ProcessedMessageId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessedMessageRepository extends JpaRepository<ProcessedMessage, ProcessedMessageId> {
}

package com.smarttrip.hotel.repository;

import com.smarttrip.hotel.entity.ProcessedMessage;
import com.smarttrip.hotel.entity.ProcessedMessageId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessedMessageRepository extends JpaRepository<ProcessedMessage, ProcessedMessageId> {
}

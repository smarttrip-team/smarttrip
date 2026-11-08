package com.smarttrip.tour.repository;

import com.smarttrip.tour.entity.ProcessedMessage;
import com.smarttrip.tour.entity.ProcessedMessageId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessedMessageRepository extends JpaRepository<ProcessedMessage, ProcessedMessageId> {
}

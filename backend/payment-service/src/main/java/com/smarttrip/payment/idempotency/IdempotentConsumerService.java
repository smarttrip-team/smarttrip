package com.smarttrip.payment.idempotency;

import com.smarttrip.payment.entity.ProcessedMessage;
import com.smarttrip.payment.entity.ProcessedMessageId;
import com.smarttrip.payment.repository.ProcessedMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class IdempotentConsumerService {

    private final ProcessedMessageRepository processedMessageRepository;

    @Transactional(readOnly = true)
    public boolean isAlreadyProcessed(String messageId, String consumerName) {
        if (messageId == null || consumerName == null) {
            return false;
        }
        return processedMessageRepository.existsById(new ProcessedMessageId(messageId, consumerName));
    }

    @Transactional
    public boolean markProcessedIfNew(String messageId, String consumerName) {
        if (messageId == null || consumerName == null) {
            return true;
        }
        if (processedMessageRepository.existsById(new ProcessedMessageId(messageId, consumerName))) {
            log.warn("Duplicate message detected: messageId={}, consumer={}. Skipping execution.",
                    messageId, consumerName);
            return false;
        }
        ProcessedMessage record = ProcessedMessage.builder()
                .messageId(messageId)
                .consumerName(consumerName)
                .build();
        processedMessageRepository.save(record);
        return true;
    }
}

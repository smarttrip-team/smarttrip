package com.smarttrip.booking.idempotency;

import com.smarttrip.booking.entity.ProcessedMessage;
import com.smarttrip.booking.entity.ProcessedMessageId;
import com.smarttrip.booking.repository.ProcessedMessageRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IdempotentConsumerServiceTest {

    @Mock
    private ProcessedMessageRepository processedMessageRepository;

    @InjectMocks
    private IdempotentConsumerService idempotentConsumerService;

    @Test
    @DisplayName("Simulate 10 duplicate messages: First succeeds, next 9 are detected as duplicate and ignored")
    void markProcessedIfNew_tenDuplicates_onlyFirstProcessed() {
        String messageId = "msg-uuid-duplicate-12345";
        String consumerName = "BookingEventListener";
        Set<ProcessedMessageId> processedSet = new HashSet<>();

        when(processedMessageRepository.existsById(any(ProcessedMessageId.class)))
                .thenAnswer(inv -> processedSet.contains((ProcessedMessageId) inv.getArgument(0)));

        when(processedMessageRepository.save(any(ProcessedMessage.class)))
                .thenAnswer(inv -> {
                    ProcessedMessage m = inv.getArgument(0);
                    processedSet.add(new ProcessedMessageId(m.getMessageId(), m.getConsumerName()));
                    return m;
                });

        int processedCount = 0;
        int skippedCount = 0;

        // Send 10 identical messages
        for (int i = 0; i < 10; i++) {
            boolean isNew = idempotentConsumerService.markProcessedIfNew(messageId, consumerName);
            if (isNew) {
                processedCount++;
            } else {
                skippedCount++;
            }
        }

        assertThat(processedCount).isEqualTo(1);
        assertThat(skippedCount).isEqualTo(9);
        verify(processedMessageRepository, times(1)).save(any(ProcessedMessage.class));
    }
}

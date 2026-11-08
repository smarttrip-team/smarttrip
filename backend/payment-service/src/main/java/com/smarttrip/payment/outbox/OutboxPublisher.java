package com.smarttrip.payment.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttrip.payment.entity.OutboxEvent;
import com.smarttrip.payment.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxPublisher {

    private final OutboxEventRepository outboxEventRepository;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper messagingObjectMapper;

    @Transactional
    public void enqueueAndPublish(String aggregateType, String aggregateId, String eventType,
                                  String exchange, String routingKey, Object payload) {
        String jsonPayload;
        try {
            jsonPayload = (payload instanceof String s) ? s : messagingObjectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            log.error("Failed to serialize outbox event payload: {}", e.getMessage());
            jsonPayload = payload.toString();
        }

        OutboxEvent event = OutboxEvent.builder()
                .aggregateType(aggregateType)
                .aggregateId(aggregateId)
                .eventType(eventType)
                .payload(jsonPayload)
                .exchange(exchange)
                .routingKey(routingKey)
                .status("PENDING")
                .build();
        OutboxEvent saved = outboxEventRepository.save(event);

        try {
            rabbitTemplate.convertAndSend(exchange, routingKey, payload);
            saved.setStatus("PUBLISHED");
            saved.setPublishedAt(LocalDateTime.now());
            outboxEventRepository.save(saved);
            log.info("Immediate publish successful for outbox event id={}", saved.getId());
        } catch (Exception e) {
            log.warn("Immediate publish failed for outbox event id={}, will be retried by worker: {}",
                    saved.getId(), e.getMessage());
        }
    }

    @Scheduled(fixedDelay = 2000)
    @Transactional
    public void publishPendingEvents() {
        List<OutboxEvent> pending = outboxEventRepository.findByStatusOrderByCreatedAtAsc("PENDING");
        if (pending.isEmpty()) return;

        log.info("PaymentService processing {} pending outbox events", pending.size());
        for (OutboxEvent event : pending) {
            try {
                Object payload = messagingObjectMapper.readTree(event.getPayload());
                rabbitTemplate.convertAndSend(event.getExchange(), event.getRoutingKey(), payload);
                event.setStatus("PUBLISHED");
                event.setPublishedAt(LocalDateTime.now());
                outboxEventRepository.save(event);
                log.info("PaymentService outbox worker successfully published event id={}", event.getId());
            } catch (Exception e) {
                event.setRetryCount(event.getRetryCount() + 1);
                outboxEventRepository.save(event);
                log.error("PaymentService failed to publish outbox event id={}, retry count={}: {}",
                        event.getId(), event.getRetryCount(), e.getMessage());
            }
        }
    }
}

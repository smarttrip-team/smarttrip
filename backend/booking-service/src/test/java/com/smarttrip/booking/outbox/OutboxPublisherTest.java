package com.smarttrip.booking.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttrip.booking.entity.OutboxEvent;
import com.smarttrip.booking.repository.OutboxEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OutboxPublisherTest {

    @Mock
    private OutboxEventRepository outboxEventRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Spy
    private ObjectMapper messagingObjectMapper = new ObjectMapper();

    @InjectMocks
    private OutboxPublisher outboxPublisher;

    @BeforeEach
    void setUp() {
        lenient().when(outboxEventRepository.save(any(OutboxEvent.class)))
                .thenAnswer(inv -> {
                    OutboxEvent e = inv.getArgument(0);
                    if (e.getId() == null) {
                        e.setId(100L);
                    }
                    return e;
                });
    }

    @Test
    @DisplayName("enqueueAndPublish: Saves event and publishes immediately when RabbitMQ is healthy")
    void enqueueAndPublish_successImmediate() {
        Map<String, String> payload = Map.of("bookingCode", "BK-001");

        outboxPublisher.enqueueAndPublish(
                "BOOKING", "1", "BOOKING_CREATED",
                "smarttrip.events", "booking.created", payload
        );

        verify(rabbitTemplate, times(1)).convertAndSend(
                eq("smarttrip.events"),
                eq("booking.created"),
                eq(payload)
        );

        ArgumentCaptor<OutboxEvent> captor = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxEventRepository, atLeastOnce()).save(captor.capture());

        OutboxEvent finalEvent = captor.getValue();
        assertThat(finalEvent.getStatus()).isEqualTo("PUBLISHED");
        assertThat(finalEvent.getPublishedAt()).isNotNull();
    }

    @Test
    @DisplayName("enqueueAndPublish: Keeps PENDING when RabbitMQ throws exception (e.g. RabbitMQ restart / network drop)")
    void enqueueAndPublish_rabbitDown_staysPending() {
        doThrow(new AmqpException("RabbitMQ connection refused"))
                .when(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Object.class));

        Map<String, String> payload = Map.of("bookingCode", "BK-002");

        outboxPublisher.enqueueAndPublish(
                "BOOKING", "2", "BOOKING_CREATED",
                "smarttrip.events", "booking.created", payload
        );

        ArgumentCaptor<OutboxEvent> captor = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxEventRepository, times(1)).save(captor.capture());

        OutboxEvent savedEvent = captor.getValue();
        assertThat(savedEvent.getStatus()).isEqualTo("PENDING");
        assertThat(savedEvent.getPublishedAt()).isNull();
    }

    @Test
    @DisplayName("publishPendingEvents: Scheduled worker recovers and publishes PENDING events once RabbitMQ restores")
    void publishPendingEvents_workerRecoversPendingEvents() {
        OutboxEvent pendingEvent = OutboxEvent.builder()
                .id(200L)
                .aggregateType("BOOKING")
                .aggregateId("5")
                .eventType("RESERVE_TOUR_COMMAND")
                .payload("{\"bookingId\":5}")
                .exchange("smarttrip.commands")
                .routingKey("tour.reserve")
                .status("PENDING")
                .retryCount(1)
                .createdAt(LocalDateTime.now().minusMinutes(2))
                .build();

        when(outboxEventRepository.findByStatusOrderByCreatedAtAsc("PENDING"))
                .thenReturn(List.of(pendingEvent));

        outboxPublisher.publishPendingEvents();

        verify(rabbitTemplate, times(1)).convertAndSend(
                eq("smarttrip.commands"),
                eq("tour.reserve"),
                any(Object.class)
        );

        assertThat(pendingEvent.getStatus()).isEqualTo("PUBLISHED");
        assertThat(pendingEvent.getPublishedAt()).isNotNull();
        verify(outboxEventRepository, times(1)).save(pendingEvent);
    }

    @Test
    @DisplayName("publishPendingEvents: Worker increments retryCount if RabbitMQ continues to fail")
    void publishPendingEvents_workerIncrementsRetryWhenStillFailing() {
        OutboxEvent pendingEvent = OutboxEvent.builder()
                .id(201L)
                .aggregateType("BOOKING")
                .aggregateId("6")
                .eventType("RESERVE_TOUR_COMMAND")
                .payload("{\"bookingId\":6}")
                .exchange("smarttrip.commands")
                .routingKey("tour.reserve")
                .status("PENDING")
                .retryCount(0)
                .createdAt(LocalDateTime.now().minusMinutes(5))
                .build();

        when(outboxEventRepository.findByStatusOrderByCreatedAtAsc("PENDING"))
                .thenReturn(List.of(pendingEvent));
        doThrow(new AmqpException("Broker unreachable"))
                .when(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Object.class));

        outboxPublisher.publishPendingEvents();

        assertThat(pendingEvent.getStatus()).isEqualTo("PENDING");
        assertThat(pendingEvent.getRetryCount()).isEqualTo(1);
        verify(outboxEventRepository, times(1)).save(pendingEvent);
    }
}

package com.smarttrip.booking.saga.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttrip.booking.idempotency.IdempotentConsumerService;
import com.smarttrip.booking.saga.BookingSagaOrchestrator;
import com.smarttrip.messaging.constant.RabbitMQConstants;
import com.smarttrip.messaging.envelope.MessageEnvelope;
import com.smarttrip.messaging.event.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingEventListener {

    private final BookingSagaOrchestrator sagaOrchestrator;
    private final ObjectMapper messagingObjectMapper;
    private final IdempotentConsumerService idempotentConsumerService;

    @RabbitListener(queues = RabbitMQConstants.QUEUE_BOOKING_EVENTS)
    public void onEvent(MessageEnvelope<Object> envelope) {
        if (envelope == null || envelope.getMessageType() == null) {
            return;
        }

        // Idempotent check
        if (!idempotentConsumerService.markProcessedIfNew(envelope.getMessageId(), "BookingEventListener")) {
            log.info("Event {} already processed by BookingEventListener. Skipping duplicate.", envelope.getMessageId());
            return;
        }

        log.info("Processing event {} with correlationId {}", envelope.getMessageType(), envelope.getCorrelationId());

        switch (envelope.getMessageType()) {
            case "TOUR_RESERVED_EVENT" -> {
                TourReservedEvent event = messagingObjectMapper.convertValue(envelope.getPayload(), TourReservedEvent.class);
                sagaOrchestrator.handleTourReserved(MessageEnvelope.<TourReservedEvent>builder()
                        .messageId(envelope.getMessageId())
                        .correlationId(envelope.getCorrelationId())
                        .causationId(envelope.getCausationId())
                        .messageType(envelope.getMessageType())
                        .occurredAt(envelope.getOccurredAt())
                        .payload(event)
                        .build());
            }
            case "HOTEL_RESERVED_EVENT" -> {
                HotelReservedEvent event = messagingObjectMapper.convertValue(envelope.getPayload(), HotelReservedEvent.class);
                sagaOrchestrator.handleHotelReserved(MessageEnvelope.<HotelReservedEvent>builder()
                        .messageId(envelope.getMessageId())
                        .correlationId(envelope.getCorrelationId())
                        .causationId(envelope.getCausationId())
                        .messageType(envelope.getMessageType())
                        .occurredAt(envelope.getOccurredAt())
                        .payload(event)
                        .build());
            }
            case "PAYMENT_AUTHORIZED_EVENT" -> {
                PaymentAuthorizedEvent event = messagingObjectMapper.convertValue(envelope.getPayload(), PaymentAuthorizedEvent.class);
                sagaOrchestrator.handlePaymentAuthorized(MessageEnvelope.<PaymentAuthorizedEvent>builder()
                        .messageId(envelope.getMessageId())
                        .correlationId(envelope.getCorrelationId())
                        .causationId(envelope.getCausationId())
                        .messageType(envelope.getMessageType())
                        .occurredAt(envelope.getOccurredAt())
                        .payload(event)
                        .build());
            }
            case "TOUR_RESERVE_FAILED_EVENT" -> {
                TourReserveFailedEvent event = messagingObjectMapper.convertValue(envelope.getPayload(), TourReserveFailedEvent.class);
                sagaOrchestrator.handleTourReserveFailed(MessageEnvelope.<TourReserveFailedEvent>builder()
                        .messageId(envelope.getMessageId())
                        .correlationId(envelope.getCorrelationId())
                        .causationId(envelope.getCausationId())
                        .messageType(envelope.getMessageType())
                        .occurredAt(envelope.getOccurredAt())
                        .payload(event)
                        .build());
            }
            case "HOTEL_RESERVE_FAILED_EVENT" -> {
                HotelReserveFailedEvent event = messagingObjectMapper.convertValue(envelope.getPayload(), HotelReserveFailedEvent.class);
                sagaOrchestrator.handleHotelReserveFailed(MessageEnvelope.<HotelReserveFailedEvent>builder()
                        .messageId(envelope.getMessageId())
                        .correlationId(envelope.getCorrelationId())
                        .causationId(envelope.getCausationId())
                        .messageType(envelope.getMessageType())
                        .occurredAt(envelope.getOccurredAt())
                        .payload(event)
                        .build());
            }
            case "PAYMENT_AUTHORIZE_FAILED_EVENT" -> {
                PaymentAuthorizeFailedEvent event = messagingObjectMapper.convertValue(envelope.getPayload(), PaymentAuthorizeFailedEvent.class);
                sagaOrchestrator.handlePaymentAuthorizeFailed(MessageEnvelope.<PaymentAuthorizeFailedEvent>builder()
                        .messageId(envelope.getMessageId())
                        .correlationId(envelope.getCorrelationId())
                        .causationId(envelope.getCausationId())
                        .messageType(envelope.getMessageType())
                        .occurredAt(envelope.getOccurredAt())
                        .payload(event)
                        .build());
            }
            default -> log.debug("Ignored event type: {}", envelope.getMessageType());
        }
    }
}

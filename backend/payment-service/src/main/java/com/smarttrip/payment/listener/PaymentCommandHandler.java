package com.smarttrip.payment.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttrip.messaging.command.AuthorizePaymentCommand;
import com.smarttrip.messaging.command.CapturePaymentCommand;
import com.smarttrip.messaging.command.VoidPaymentCommand;
import com.smarttrip.messaging.constant.RabbitMQConstants;
import com.smarttrip.messaging.envelope.MessageEnvelope;
import com.smarttrip.messaging.event.PaymentAuthorizeFailedEvent;
import com.smarttrip.messaging.event.PaymentAuthorizedEvent;
import com.smarttrip.payment.dto.PaymentResponse;
import com.smarttrip.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentCommandHandler {

    private final PaymentService paymentService;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper messagingObjectMapper;

    @RabbitListener(queues = RabbitMQConstants.QUEUE_PAYMENT_COMMANDS)
    public void onPaymentCommand(MessageEnvelope<Object> envelope) {
        if (envelope == null || envelope.getMessageType() == null) {
            return;
        }

        log.info("Payment Service received command: {}", envelope.getMessageType());

        switch (envelope.getMessageType()) {
            case "AUTHORIZE_PAYMENT_COMMAND" -> {
                AuthorizePaymentCommand cmd = messagingObjectMapper.convertValue(envelope.getPayload(), AuthorizePaymentCommand.class);
                handleAuthorize(cmd, envelope.getCorrelationId(), envelope.getMessageId());
            }
            case "CAPTURE_PAYMENT_COMMAND" -> {
                CapturePaymentCommand cmd = messagingObjectMapper.convertValue(envelope.getPayload(), CapturePaymentCommand.class);
                handleCapture(cmd);
            }
            case "VOID_PAYMENT_COMMAND" -> {
                VoidPaymentCommand cmd = messagingObjectMapper.convertValue(envelope.getPayload(), VoidPaymentCommand.class);
                handleVoid(cmd);
            }
            default -> log.debug("Payment Service ignored command: {}", envelope.getMessageType());
        }
    }

    private void handleAuthorize(AuthorizePaymentCommand cmd, String correlationId, String causationId) {
        try {
            PaymentResponse response = paymentService.authorize(cmd.getUserId(), cmd.getBookingCode(), cmd.getAmount());

            PaymentAuthorizedEvent event = PaymentAuthorizedEvent.builder()
                    .bookingId(cmd.getBookingId())
                    .bookingCode(cmd.getBookingCode())
                    .paymentId(response.getId())
                    .authorizedAmount(cmd.getAmount())
                    .build();

            rabbitTemplate.convertAndSend(
                    RabbitMQConstants.EXCHANGE_EVENTS,
                    RabbitMQConstants.ROUTING_KEY_PAYMENT_AUTHORIZED,
                    MessageEnvelope.of("PAYMENT_AUTHORIZED_EVENT", event, correlationId, causationId)
            );
            log.info("Payment authorized for booking {}. Emitted PaymentAuthorizedEvent.", cmd.getBookingCode());
        } catch (Exception e) {
            log.error("Failed to authorize payment for booking {}: {}", cmd.getBookingCode(), e.getMessage());
            PaymentAuthorizeFailedEvent failEvent = PaymentAuthorizeFailedEvent.builder()
                    .bookingId(cmd.getBookingId())
                    .bookingCode(cmd.getBookingCode())
                    .reason(e.getMessage())
                    .build();

            rabbitTemplate.convertAndSend(
                    RabbitMQConstants.EXCHANGE_EVENTS,
                    RabbitMQConstants.ROUTING_KEY_PAYMENT_AUTHORIZE_FAILED,
                    MessageEnvelope.of("PAYMENT_AUTHORIZE_FAILED_EVENT", failEvent, correlationId, causationId)
            );
        }
    }

    private void handleCapture(CapturePaymentCommand cmd) {
        try {
            paymentService.capture(cmd.getUserId(), cmd.getBookingCode(), cmd.getAmount());
            log.info("Payment captured for booking {}", cmd.getBookingCode());
        } catch (Exception e) {
            log.error("Failed to capture payment for booking {}: {}", cmd.getBookingCode(), e.getMessage());
        }
    }

    private void handleVoid(VoidPaymentCommand cmd) {
        try {
            paymentService.voidAuthorization(cmd.getUserId(), cmd.getBookingCode());
            log.info("Payment voided for booking {}", cmd.getBookingCode());
        } catch (Exception e) {
            log.error("Failed to void payment for booking {}: {}", cmd.getBookingCode(), e.getMessage());
        }
    }
}

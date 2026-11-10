package com.smarttrip.payment.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttrip.messaging.command.AuthorizePaymentCommand;
import com.smarttrip.messaging.command.CapturePaymentCommand;
import com.smarttrip.messaging.command.RefundPaymentCommand;
import com.smarttrip.messaging.command.VoidPaymentCommand;
import com.smarttrip.messaging.constant.RabbitMQConstants;
import com.smarttrip.messaging.envelope.MessageEnvelope;
import com.smarttrip.messaging.event.PaymentAuthorizeFailedEvent;
import com.smarttrip.messaging.event.PaymentAuthorizedEvent;
import com.smarttrip.payment.dto.PaymentResponse;
import com.smarttrip.payment.idempotency.IdempotentConsumerService;
import com.smarttrip.payment.outbox.OutboxPublisher;
import com.smarttrip.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentCommandHandler {

    private final PaymentService paymentService;
    private final IdempotentConsumerService idempotentConsumerService;
    private final OutboxPublisher outboxPublisher;
    private final ObjectMapper messagingObjectMapper;

    @RabbitListener(queues = RabbitMQConstants.QUEUE_PAYMENT_COMMANDS)
    @Transactional
    public void onPaymentCommand(MessageEnvelope<Object> envelope) {
        if (envelope == null || envelope.getMessageType() == null) {
            return;
        }

        // Idempotency check: Ignore duplicate messages
        if (!idempotentConsumerService.markProcessedIfNew(envelope.getMessageId(), "PaymentCommandHandler")) {
            log.warn("PaymentCommandHandler skipped duplicate command messageId={}", envelope.getMessageId());
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
            case "REFUND_PAYMENT_COMMAND" -> {
                RefundPaymentCommand cmd = messagingObjectMapper.convertValue(envelope.getPayload(), RefundPaymentCommand.class);
                handleRefund(cmd);
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

            MessageEnvelope<PaymentAuthorizedEvent> evtEnvelope = MessageEnvelope.of(
                    "PAYMENT_AUTHORIZED_EVENT", event, correlationId, causationId
            );

            outboxPublisher.enqueueAndPublish(
                    "Payment",
                    response.getId().toString(),
                    "PAYMENT_AUTHORIZED_EVENT",
                    RabbitMQConstants.EXCHANGE_EVENTS,
                    RabbitMQConstants.ROUTING_KEY_PAYMENT_AUTHORIZED,
                    evtEnvelope
            );
            log.info("Payment authorized for booking {}. Emitted PaymentAuthorizedEvent via outbox.", cmd.getBookingCode());
        } catch (Exception e) {
            log.error("Failed to authorize payment for booking {}: {}", cmd.getBookingCode(), e.getMessage());
            PaymentAuthorizeFailedEvent failEvent = PaymentAuthorizeFailedEvent.builder()
                    .bookingId(cmd.getBookingId())
                    .bookingCode(cmd.getBookingCode())
                    .reason(e.getMessage())
                    .build();

            MessageEnvelope<PaymentAuthorizeFailedEvent> evtEnvelope = MessageEnvelope.of(
                    "PAYMENT_AUTHORIZE_FAILED_EVENT", failEvent, correlationId, causationId
            );

            outboxPublisher.enqueueAndPublish(
                    "Payment",
                    cmd.getBookingId().toString(),
                    "PAYMENT_AUTHORIZE_FAILED_EVENT",
                    RabbitMQConstants.EXCHANGE_EVENTS,
                    RabbitMQConstants.ROUTING_KEY_PAYMENT_AUTHORIZE_FAILED,
                    evtEnvelope
            );
        }
    }

    private void handleCapture(CapturePaymentCommand cmd) {
        try {
            paymentService.capture(
                    cmd.getUserId(),
                    cmd.getBookingCode(),
                    cmd.getAmount(),
                    cmd.getOperatorId(),
                    cmd.getTourAmount(),
                    cmd.getHotelierId(),
                    cmd.getHotelAmount()
            );
            log.info("Payment captured and settled for booking {}", cmd.getBookingCode());
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

    private void handleRefund(RefundPaymentCommand cmd) {
        try {
            if (cmd.getAmount() != null && cmd.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                paymentService.refund(cmd.getUserId(), cmd.getBookingCode(), cmd.getAmount(), cmd.getReason());
                log.info("Payment refunded for booking {}: amount={}", cmd.getBookingCode(), cmd.getAmount());
            } else {
                log.info("Refund amount is 0 for booking {}, skipping wallet balance credit", cmd.getBookingCode());
            }
        } catch (Exception e) {
            log.error("Failed to refund payment for booking {}: {}", cmd.getBookingCode(), e.getMessage());
        }
    }
}

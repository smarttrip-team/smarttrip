package com.smarttrip.payment.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttrip.messaging.command.AuthorizePaymentCommand;
import com.smarttrip.messaging.command.CapturePaymentCommand;
import com.smarttrip.messaging.constant.RabbitMQConstants;
import com.smarttrip.messaging.envelope.MessageEnvelope;
import com.smarttrip.messaging.event.PaymentAuthorizedEvent;
import com.smarttrip.payment.dto.PaymentResponse;
import com.smarttrip.payment.idempotency.IdempotentConsumerService;
import com.smarttrip.payment.outbox.OutboxPublisher;
import com.smarttrip.payment.service.PaymentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentCommandHandlerTest {

    @Mock
    private PaymentService paymentService;

    @Mock
    private IdempotentConsumerService idempotentConsumerService;

    @Mock
    private OutboxPublisher outboxPublisher;

    @Spy
    private ObjectMapper messagingObjectMapper = new ObjectMapper();

    @InjectMocks
    private PaymentCommandHandler paymentCommandHandler;

    @Test
    @DisplayName("Should process AuthorizePaymentCommand and emit PaymentAuthorizedEvent via Outbox")
    void handleAuthorize_success() {
        when(idempotentConsumerService.markProcessedIfNew("msg-pay-1", "PaymentCommandHandler")).thenReturn(true);

        AuthorizePaymentCommand cmd = AuthorizePaymentCommand.builder()
                .bookingId(1L)
                .bookingCode("BK-PAY-1")
                .userId(10L)
                .amount(new BigDecimal("3000000.00"))
                .build();

        PaymentResponse response = PaymentResponse.builder()
                .id(99L)
                .bookingId("BK-PAY-1")
                .amount(new BigDecimal("3000000.00"))
                .status("AUTHORIZED")
                .build();

        when(paymentService.authorize(10L, "BK-PAY-1", new BigDecimal("3000000.00"))).thenReturn(response);

        MessageEnvelope<Object> envelope = MessageEnvelope.<Object>builder()
                .messageId("msg-pay-1")
                .correlationId("saga-pay-1")
                .messageType("AUTHORIZE_PAYMENT_COMMAND")
                .payload(cmd)
                .build();

        paymentCommandHandler.onPaymentCommand(envelope);

        ArgumentCaptor<Object> captor = ArgumentCaptor.forClass(Object.class);
        verify(outboxPublisher, times(1)).enqueueAndPublish(
                eq("Payment"),
                eq("99"),
                eq("PAYMENT_AUTHORIZED_EVENT"),
                eq(RabbitMQConstants.EXCHANGE_EVENTS),
                eq(RabbitMQConstants.ROUTING_KEY_PAYMENT_AUTHORIZED),
                captor.capture()
        );

        MessageEnvelope evtEnvelope = (MessageEnvelope) captor.getValue();
        PaymentAuthorizedEvent evt = (PaymentAuthorizedEvent) evtEnvelope.getPayload();
        assertThat(evt.getPaymentId()).isEqualTo(99L);
        assertThat(evt.getAuthorizedAmount()).isEqualByComparingTo("3000000.00");
    }

    @Test
    @DisplayName("Idempotency: Sending 10 duplicate AuthorizePaymentCommand only authorizes ONCE")
    void handleAuthorize_tenDuplicateMessages_authorizesOnlyOnce() {
        String duplicateMsgId = "msg-dup-pay-555";
        Set<String> processedMsgIds = new HashSet<>();

        when(idempotentConsumerService.markProcessedIfNew(eq(duplicateMsgId), eq("PaymentCommandHandler")))
                .thenAnswer(inv -> processedMsgIds.add(duplicateMsgId));

        AuthorizePaymentCommand cmd = AuthorizePaymentCommand.builder()
                .bookingId(2L)
                .bookingCode("BK-PAY-DUP")
                .userId(10L)
                .amount(new BigDecimal("2000000.00"))
                .build();

        PaymentResponse response = PaymentResponse.builder()
                .id(100L)
                .bookingId("BK-PAY-DUP")
                .amount(new BigDecimal("2000000.00"))
                .status("AUTHORIZED")
                .build();

        when(paymentService.authorize(10L, "BK-PAY-DUP", new BigDecimal("2000000.00"))).thenReturn(response);

        MessageEnvelope<Object> envelope = MessageEnvelope.<Object>builder()
                .messageId(duplicateMsgId)
                .correlationId("saga-pay-dup")
                .messageType("AUTHORIZE_PAYMENT_COMMAND")
                .payload(cmd)
                .build();

        for (int i = 0; i < 10; i++) {
            paymentCommandHandler.onPaymentCommand(envelope);
        }

        verify(paymentService, times(1)).authorize(10L, "BK-PAY-DUP", new BigDecimal("2000000.00"));
        verify(outboxPublisher, times(1)).enqueueAndPublish(any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should process CapturePaymentCommand")
    void handleCapture_success() {
        when(idempotentConsumerService.markProcessedIfNew("msg-capture-1", "PaymentCommandHandler")).thenReturn(true);

        CapturePaymentCommand cmd = CapturePaymentCommand.builder()
                .bookingId(1L)
                .bookingCode("BK-PAY-1")
                .userId(10L)
                .amount(new BigDecimal("3000000.00"))
                .build();

        MessageEnvelope<Object> envelope = MessageEnvelope.<Object>builder()
                .messageId("msg-capture-1")
                .messageType("CAPTURE_PAYMENT_COMMAND")
                .payload(cmd)
                .build();

        paymentCommandHandler.onPaymentCommand(envelope);

        verify(paymentService, times(1)).capture(10L, "BK-PAY-1", new BigDecimal("3000000.00"));
    }
}

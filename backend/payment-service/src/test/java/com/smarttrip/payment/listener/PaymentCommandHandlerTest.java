package com.smarttrip.payment.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttrip.messaging.command.AuthorizePaymentCommand;
import com.smarttrip.messaging.command.CapturePaymentCommand;
import com.smarttrip.messaging.constant.RabbitMQConstants;
import com.smarttrip.messaging.envelope.MessageEnvelope;
import com.smarttrip.messaging.event.PaymentAuthorizedEvent;
import com.smarttrip.payment.dto.PaymentResponse;
import com.smarttrip.payment.service.PaymentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentCommandHandlerTest {

    @Mock
    private PaymentService paymentService;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Spy
    private ObjectMapper messagingObjectMapper = new ObjectMapper();

    @InjectMocks
    private PaymentCommandHandler paymentCommandHandler;

    @Test
    @DisplayName("Should process AuthorizePaymentCommand and emit PaymentAuthorizedEvent")
    void handleAuthorize_success() {
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

        ArgumentCaptor<MessageEnvelope> captor = ArgumentCaptor.forClass(MessageEnvelope.class);
        verify(rabbitTemplate, times(1)).convertAndSend(
                eq(RabbitMQConstants.EXCHANGE_EVENTS),
                eq(RabbitMQConstants.ROUTING_KEY_PAYMENT_AUTHORIZED),
                captor.capture()
        );

        PaymentAuthorizedEvent evt = (PaymentAuthorizedEvent) captor.getValue().getPayload();
        assertThat(evt.getPaymentId()).isEqualTo(99L);
        assertThat(evt.getAuthorizedAmount()).isEqualByComparingTo("3000000.00");
    }

    @Test
    @DisplayName("Should process CapturePaymentCommand")
    void handleCapture_success() {
        CapturePaymentCommand cmd = CapturePaymentCommand.builder()
                .bookingId(1L)
                .bookingCode("BK-PAY-1")
                .userId(10L)
                .amount(new BigDecimal("3000000.00"))
                .build();

        MessageEnvelope<Object> envelope = MessageEnvelope.<Object>builder()
                .messageType("CAPTURE_PAYMENT_COMMAND")
                .payload(cmd)
                .build();

        paymentCommandHandler.onPaymentCommand(envelope);

        verify(paymentService, times(1)).capture(10L, "BK-PAY-1", new BigDecimal("3000000.00"));
    }
}

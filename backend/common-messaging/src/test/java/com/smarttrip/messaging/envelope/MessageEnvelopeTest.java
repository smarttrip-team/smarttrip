package com.smarttrip.messaging.envelope;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.smarttrip.messaging.command.AuthorizePaymentCommand;
import com.smarttrip.messaging.command.ReserveHotelCommand;
import com.smarttrip.messaging.command.ReserveTourCommand;
import com.smarttrip.messaging.event.HotelReservedEvent;
import com.smarttrip.messaging.event.PaymentAuthorizedEvent;
import com.smarttrip.messaging.event.TourReservedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class MessageEnvelopeTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Test
    @DisplayName("Should serialize and deserialize MessageEnvelope with ReserveTourCommand")
    void testReserveTourCommandSerialization() throws Exception {
        ReserveTourCommand command = ReserveTourCommand.builder()
                .bookingId(1L)
                .bookingCode("BK-20261201-ABCD")
                .tourId(100L)
                .departureId(200L)
                .quantity(2)
                .build();

        MessageEnvelope<ReserveTourCommand> envelope = MessageEnvelope.of(
                "RESERVE_TOUR_COMMAND",
                command,
                "saga-123",
                "causation-456"
        );

        String json = objectMapper.writeValueAsString(envelope);
        assertThat(json).contains("RESERVE_TOUR_COMMAND");
        assertThat(json).contains("BK-20261201-ABCD");

        MessageEnvelope<ReserveTourCommand> deserialized = objectMapper.readValue(
                json,
                new TypeReference<MessageEnvelope<ReserveTourCommand>>() {}
        );

        assertThat(deserialized.getMessageId()).isEqualTo(envelope.getMessageId());
        assertThat(deserialized.getCorrelationId()).isEqualTo("saga-123");
        assertThat(deserialized.getCausationId()).isEqualTo("causation-456");
        assertThat(deserialized.getPayload().getBookingCode()).isEqualTo("BK-20261201-ABCD");
        assertThat(deserialized.getPayload().getQuantity()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should serialize and deserialize MessageEnvelope with ReserveHotelCommand including LocalDate")
    void testReserveHotelCommandSerialization() throws Exception {
        ReserveHotelCommand command = ReserveHotelCommand.builder()
                .bookingId(1L)
                .bookingCode("BK-HOTEL-1")
                .hotelId(10L)
                .roomTypeId(20L)
                .checkInDate(LocalDate.of(2026, 12, 1))
                .checkOutDate(LocalDate.of(2026, 12, 3))
                .roomQuantity(1)
                .build();

        MessageEnvelope<ReserveHotelCommand> envelope = MessageEnvelope.of("RESERVE_HOTEL_COMMAND", command, "saga-hotel-1");

        String json = objectMapper.writeValueAsString(envelope);
        assertThat(json).contains("2026-12-01");

        MessageEnvelope<ReserveHotelCommand> deserialized = objectMapper.readValue(
                json,
                new TypeReference<MessageEnvelope<ReserveHotelCommand>>() {}
        );

        assertThat(deserialized.getPayload().getCheckInDate()).isEqualTo(LocalDate.of(2026, 12, 1));
        assertThat(deserialized.getPayload().getCheckOutDate()).isEqualTo(LocalDate.of(2026, 12, 3));
    }

    @Test
    @DisplayName("Should serialize and deserialize MessageEnvelope with AuthorizePaymentCommand including BigDecimal")
    void testAuthorizePaymentCommandSerialization() throws Exception {
        AuthorizePaymentCommand command = AuthorizePaymentCommand.builder()
                .bookingId(1L)
                .bookingCode("BK-PAY-1")
                .userId(50L)
                .amount(new BigDecimal("3500000.00"))
                .currency("VND")
                .build();

        MessageEnvelope<AuthorizePaymentCommand> envelope = MessageEnvelope.of("AUTHORIZE_PAYMENT", command, "saga-pay");

        String json = objectMapper.writeValueAsString(envelope);
        assertThat(json).contains("3500000.00");

        MessageEnvelope<AuthorizePaymentCommand> deserialized = objectMapper.readValue(
                json,
                new TypeReference<MessageEnvelope<AuthorizePaymentCommand>>() {}
        );

        assertThat(deserialized.getPayload().getAmount()).isEqualByComparingTo("3500000.00");
    }

    @Test
    @DisplayName("Should serialize and deserialize MessageEnvelope with TourReservedEvent")
    void testTourReservedEventSerialization() throws Exception {
        TourReservedEvent event = TourReservedEvent.builder()
                .bookingId(1L)
                .bookingCode("BK-TOUR-EVT")
                .reservationId(999L)
                .tourId(100L)
                .departureId(200L)
                .quantity(2)
                .unitPrice(new BigDecimal("1500000.00"))
                .totalPrice(new BigDecimal("3000000.00"))
                .build();

        MessageEnvelope<TourReservedEvent> envelope = MessageEnvelope.of("TOUR_RESERVED_EVENT", event, "corr-evt-1");

        String json = objectMapper.writeValueAsString(envelope);
        MessageEnvelope<TourReservedEvent> deserialized = objectMapper.readValue(
                json,
                new TypeReference<MessageEnvelope<TourReservedEvent>>() {}
        );

        assertThat(deserialized.getPayload().getReservationId()).isEqualTo(999L);
        assertThat(deserialized.getPayload().getTotalPrice()).isEqualByComparingTo("3000000.00");
    }

    @Test
    @DisplayName("Should serialize and deserialize MessageEnvelope with HotelReservedEvent")
    void testHotelReservedEventSerialization() throws Exception {
        HotelReservedEvent event = HotelReservedEvent.builder()
                .bookingId(1L)
                .bookingCode("BK-HOTEL-EVT")
                .hotelId(10L)
                .roomTypeId(20L)
                .roomQuantity(1)
                .price(new BigDecimal("1200000.00"))
                .build();

        MessageEnvelope<HotelReservedEvent> envelope = MessageEnvelope.of("HOTEL_RESERVED_EVENT", event, "corr-evt-2");

        String json = objectMapper.writeValueAsString(envelope);
        MessageEnvelope<HotelReservedEvent> deserialized = objectMapper.readValue(
                json,
                new TypeReference<MessageEnvelope<HotelReservedEvent>>() {}
        );

        assertThat(deserialized.getPayload().getPrice()).isEqualByComparingTo("1200000.00");
    }

    @Test
    @DisplayName("Should serialize and deserialize MessageEnvelope with PaymentAuthorizedEvent")
    void testPaymentAuthorizedEventSerialization() throws Exception {
        PaymentAuthorizedEvent event = PaymentAuthorizedEvent.builder()
                .bookingId(1L)
                .bookingCode("BK-PAY-EVT")
                .paymentId(555L)
                .authorizedAmount(new BigDecimal("4200000.00"))
                .build();

        MessageEnvelope<PaymentAuthorizedEvent> envelope = MessageEnvelope.of("PAYMENT_AUTHORIZED_EVENT", event, "corr-evt-3");

        String json = objectMapper.writeValueAsString(envelope);
        MessageEnvelope<PaymentAuthorizedEvent> deserialized = objectMapper.readValue(
                json,
                new TypeReference<MessageEnvelope<PaymentAuthorizedEvent>>() {}
        );

        assertThat(deserialized.getPayload().getAuthorizedAmount()).isEqualByComparingTo("4200000.00");
    }
}

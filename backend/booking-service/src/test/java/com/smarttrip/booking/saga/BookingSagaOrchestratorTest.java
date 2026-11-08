package com.smarttrip.booking.saga;

import com.smarttrip.booking.entity.*;
import com.smarttrip.booking.repository.BookingRepository;
import com.smarttrip.booking.repository.SagaInstanceRepository;
import com.smarttrip.booking.repository.SagaStepRepository;
import com.smarttrip.booking.saga.impl.BookingSagaOrchestratorImpl;
import com.smarttrip.messaging.command.AuthorizePaymentCommand;
import com.smarttrip.messaging.command.ReserveHotelCommand;
import com.smarttrip.messaging.command.ReserveTourCommand;
import com.smarttrip.messaging.constant.RabbitMQConstants;
import com.smarttrip.messaging.envelope.MessageEnvelope;
import com.smarttrip.messaging.event.HotelReservedEvent;
import com.smarttrip.messaging.event.PaymentAuthorizedEvent;
import com.smarttrip.messaging.event.TourReservedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingSagaOrchestratorTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private SagaInstanceRepository sagaInstanceRepository;

    @Mock
    private SagaStepRepository sagaStepRepository;

    @InjectMocks
    private BookingSagaOrchestratorImpl sagaOrchestrator;

    private Booking mockBooking;
    private SagaInstance mockSaga;
    private final Map<String, SagaStep> stepsMap = new HashMap<>();

    @BeforeEach
    void setUp() {
        mockBooking = Booking.builder()
                .id(1L)
                .bookingCode("BK-20261201-1234")
                .customerId(10L)
                .status("PENDING")
                .totalAmount(new BigDecimal("5000000.00"))
                .currency("VND")
                .items(new ArrayList<>(List.of(
                        BookingItem.builder()
                                .id(10L)
                                .tourId(100L)
                                .departureId(200L)
                                .tourNameSnapshot("Ha Long Bay 2D1N")
                                .departureDateSnapshot(LocalDate.now().plusDays(10))
                                .unitPriceSnapshot(new BigDecimal("2500000.00"))
                                .quantity(2)
                                .subtotal(new BigDecimal("5000000.00"))
                                .build()
                )))
                .passengers(new ArrayList<>())
                .hotelDetails(new ArrayList<>())
                .build();

        mockSaga = SagaInstance.builder()
                .id(1L)
                .sagaId("saga-uuid-1")
                .bookingId(1L)
                .sagaType("BOOKING_CREATE")
                .status("STARTED")
                .currentStep("PENDING_CONFIRMATION")
                .build();

        lenient().when(sagaStepRepository.findBySagaInstanceSagaIdAndStepName(anyString(), anyString()))
                .thenAnswer(inv -> Optional.ofNullable(stepsMap.get(inv.getArgument(0) + ":" + inv.getArgument(1))));

        lenient().when(sagaStepRepository.save(any(SagaStep.class))).thenAnswer(inv -> {
            SagaStep s = inv.getArgument(0);
            stepsMap.put(s.getSagaInstance().getSagaId() + ":" + s.getStepName(), s);
            return s;
        });
    }

    @Test
    @DisplayName("Step 1: Should start saga, record step RESERVE_TOUR, and publish ReserveTourCommand")
    void startSaga_success() {
        sagaOrchestrator.startSaga(mockBooking, mockSaga);

        assertThat(mockSaga.getStatus()).isEqualTo("PROCESSING");
        assertThat(mockSaga.getCurrentStep()).isEqualTo("RESERVE_TOUR");

        SagaStep step = stepsMap.get("saga-uuid-1:RESERVE_TOUR");
        assertThat(step).isNotNull();
        assertThat(step.getStatus()).isEqualTo("PENDING");

        ArgumentCaptor<MessageEnvelope> captor = ArgumentCaptor.forClass(MessageEnvelope.class);
        verify(rabbitTemplate, times(1)).convertAndSend(
                eq(RabbitMQConstants.EXCHANGE_COMMANDS),
                eq(RabbitMQConstants.ROUTING_KEY_RESERVE_TOUR),
                captor.capture()
        );

        MessageEnvelope envelope = captor.getValue();
        assertThat(envelope.getMessageType()).isEqualTo("RESERVE_TOUR_COMMAND");
        assertThat(envelope.getCorrelationId()).isEqualTo("saga-uuid-1");
        ReserveTourCommand payload = (ReserveTourCommand) envelope.getPayload();
        assertThat(payload.getBookingId()).isEqualTo(1L);
        assertThat(payload.getQuantity()).isEqualTo(2);
    }

    @Test
    @DisplayName("Step 2 (No Hotel): Handle TourReservedEvent -> Complete RESERVE_TOUR and proceed to AUTHORIZE_PAYMENT")
    void handleTourReserved_noHotel_authorizesPayment() {
        when(sagaInstanceRepository.findBySagaId("saga-uuid-1")).thenReturn(Optional.of(mockSaga));
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(mockBooking));

        // Pre-create pending RESERVE_TOUR step
        stepsMap.put("saga-uuid-1:RESERVE_TOUR", SagaStep.builder()
                .sagaInstance(mockSaga)
                .stepName("RESERVE_TOUR")
                .status("PENDING")
                .build());

        TourReservedEvent event = TourReservedEvent.builder()
                .bookingId(1L)
                .bookingCode("BK-20261201-1234")
                .tourId(100L)
                .departureId(200L)
                .quantity(2)
                .build();

        sagaOrchestrator.handleTourReserved(MessageEnvelope.of("TOUR_RESERVED_EVENT", event, "saga-uuid-1"));

        assertThat(stepsMap.get("saga-uuid-1:RESERVE_TOUR").getStatus()).isEqualTo("COMPLETED");
        assertThat(stepsMap.get("saga-uuid-1:AUTHORIZE_PAYMENT").getStatus()).isEqualTo("PENDING");

        verify(rabbitTemplate, times(1)).convertAndSend(
                eq(RabbitMQConstants.EXCHANGE_COMMANDS),
                eq(RabbitMQConstants.ROUTING_KEY_AUTHORIZE_PAYMENT),
                any(MessageEnvelope.class)
        );
    }

    @Test
    @DisplayName("Step 2 (With Hotel): Handle TourReservedEvent -> Complete RESERVE_TOUR and trigger RESERVE_HOTEL")
    void handleTourReserved_withHotel_reservesHotel() {
        mockBooking.getHotelDetails().add(BookingHotelDetail.builder()
                .hotelId(50L)
                .roomTypeId(60L)
                .checkInDate(LocalDate.now().plusDays(10))
                .checkOutDate(LocalDate.now().plusDays(12))
                .roomQuantity(1)
                .priceSnapshot(new BigDecimal("1000000.00"))
                .build());

        when(sagaInstanceRepository.findBySagaId("saga-uuid-1")).thenReturn(Optional.of(mockSaga));
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(mockBooking));

        stepsMap.put("saga-uuid-1:RESERVE_TOUR", SagaStep.builder()
                .sagaInstance(mockSaga)
                .stepName("RESERVE_TOUR")
                .status("PENDING")
                .build());

        TourReservedEvent event = TourReservedEvent.builder()
                .bookingId(1L)
                .bookingCode("BK-20261201-1234")
                .tourId(100L)
                .departureId(200L)
                .quantity(2)
                .build();

        sagaOrchestrator.handleTourReserved(MessageEnvelope.of("TOUR_RESERVED_EVENT", event, "saga-uuid-1"));

        assertThat(stepsMap.get("saga-uuid-1:RESERVE_TOUR").getStatus()).isEqualTo("COMPLETED");
        assertThat(stepsMap.get("saga-uuid-1:RESERVE_HOTEL").getStatus()).isEqualTo("PENDING");

        verify(rabbitTemplate, times(1)).convertAndSend(
                eq(RabbitMQConstants.EXCHANGE_COMMANDS),
                eq(RabbitMQConstants.ROUTING_KEY_RESERVE_HOTEL),
                any(MessageEnvelope.class)
        );
    }

    @Test
    @DisplayName("Step 3: Handle HotelReservedEvent -> Complete RESERVE_HOTEL and proceed to AUTHORIZE_PAYMENT")
    void handleHotelReserved_success() {
        when(sagaInstanceRepository.findBySagaId("saga-uuid-1")).thenReturn(Optional.of(mockSaga));
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(mockBooking));

        stepsMap.put("saga-uuid-1:RESERVE_HOTEL", SagaStep.builder()
                .sagaInstance(mockSaga)
                .stepName("RESERVE_HOTEL")
                .status("PENDING")
                .build());

        HotelReservedEvent event = HotelReservedEvent.builder()
                .bookingId(1L)
                .bookingCode("BK-20261201-1234")
                .hotelId(50L)
                .roomTypeId(60L)
                .roomQuantity(1)
                .price(new BigDecimal("1000000.00"))
                .build();

        sagaOrchestrator.handleHotelReserved(MessageEnvelope.of("HOTEL_RESERVED_EVENT", event, "saga-uuid-1"));

        assertThat(stepsMap.get("saga-uuid-1:RESERVE_HOTEL").getStatus()).isEqualTo("COMPLETED");
        assertThat(stepsMap.get("saga-uuid-1:AUTHORIZE_PAYMENT").getStatus()).isEqualTo("PENDING");

        verify(rabbitTemplate, times(1)).convertAndSend(
                eq(RabbitMQConstants.EXCHANGE_COMMANDS),
                eq(RabbitMQConstants.ROUTING_KEY_AUTHORIZE_PAYMENT),
                any(MessageEnvelope.class)
        );
    }

    @Test
    @DisplayName("Step 4 & Finalize: Handle PaymentAuthorizedEvent -> Confirm, Capture, and update booking to CONFIRMED")
    void handlePaymentAuthorized_success_completesSagaAndConfirmsBooking() {
        when(sagaInstanceRepository.findBySagaId("saga-uuid-1")).thenReturn(Optional.of(mockSaga));
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(mockBooking));

        stepsMap.put("saga-uuid-1:AUTHORIZE_PAYMENT", SagaStep.builder()
                .sagaInstance(mockSaga)
                .stepName("AUTHORIZE_PAYMENT")
                .status("PENDING")
                .build());

        PaymentAuthorizedEvent event = PaymentAuthorizedEvent.builder()
                .bookingId(1L)
                .bookingCode("BK-20261201-1234")
                .paymentId(77L)
                .authorizedAmount(new BigDecimal("5000000.00"))
                .build();

        sagaOrchestrator.handlePaymentAuthorized(MessageEnvelope.of("PAYMENT_AUTHORIZED_EVENT", event, "saga-uuid-1"));

        assertThat(stepsMap.get("saga-uuid-1:AUTHORIZE_PAYMENT").getStatus()).isEqualTo("COMPLETED");
        assertThat(stepsMap.get("saga-uuid-1:CONFIRM_RESOURCES").getStatus()).isEqualTo("COMPLETED");
        assertThat(stepsMap.get("saga-uuid-1:CAPTURE_PAYMENT").getStatus()).isEqualTo("COMPLETED");

        // Verify commands sent: ConfirmTour and CapturePayment
        verify(rabbitTemplate, times(1)).convertAndSend(
                eq(RabbitMQConstants.EXCHANGE_COMMANDS),
                eq(RabbitMQConstants.ROUTING_KEY_CONFIRM_TOUR),
                any(MessageEnvelope.class)
        );
        verify(rabbitTemplate, times(1)).convertAndSend(
                eq(RabbitMQConstants.EXCHANGE_COMMANDS),
                eq(RabbitMQConstants.ROUTING_KEY_CAPTURE_PAYMENT),
                any(MessageEnvelope.class)
        );

        // Verify booking confirmed & saga completed
        assertThat(mockBooking.getStatus()).isEqualTo("CONFIRMED");
        assertThat(mockSaga.getStatus()).isEqualTo("COMPLETED");
        assertThat(mockSaga.getCurrentStep()).isEqualTo("COMPLETED");
        assertThat(mockSaga.getCompletedAt()).isNotNull();

        verify(bookingRepository, times(1)).save(mockBooking);
        verify(sagaInstanceRepository, times(1)).save(mockSaga);
    }
}

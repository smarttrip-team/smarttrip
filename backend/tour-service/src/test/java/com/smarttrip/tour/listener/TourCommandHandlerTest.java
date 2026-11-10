package com.smarttrip.tour.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttrip.messaging.command.ConfirmTourCommand;
import com.smarttrip.messaging.command.ReleaseTourCommand;
import com.smarttrip.messaging.command.ReserveTourCommand;
import com.smarttrip.messaging.constant.RabbitMQConstants;
import com.smarttrip.messaging.envelope.MessageEnvelope;
import com.smarttrip.messaging.event.TourReservedEvent;
import com.smarttrip.tour.entity.TourDeparture;
import com.smarttrip.tour.entity.TourReservation;
import com.smarttrip.tour.enums.ReservationStatus;
import com.smarttrip.tour.idempotency.IdempotentConsumerService;
import com.smarttrip.tour.outbox.OutboxPublisher;
import com.smarttrip.tour.repository.TourDepartureRepository;
import com.smarttrip.tour.repository.TourReservationRepository;
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
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TourCommandHandlerTest {

    @Mock
    private TourDepartureRepository tourDepartureRepository;

    @Mock
    private TourReservationRepository tourReservationRepository;

    @Mock
    private IdempotentConsumerService idempotentConsumerService;

    @Mock
    private OutboxPublisher outboxPublisher;

    @Spy
    private ObjectMapper messagingObjectMapper = new ObjectMapper();

    @InjectMocks
    private TourCommandHandler tourCommandHandler;

    @Test
    @DisplayName("Should process ReserveTourCommand, decrement seats and emit TourReservedEvent via Outbox")
    void handleReserveTour_success() {
        when(idempotentConsumerService.markProcessedIfNew("msg-1", "TourCommandHandler")).thenReturn(true);

        TourDeparture departure = TourDeparture.builder()
                .id(200L)
                .availableSeats(10)
                .price(new BigDecimal("1500000.00"))
                .build();

        when(tourDepartureRepository.findById(200L)).thenReturn(Optional.of(departure));
        when(tourReservationRepository.save(any(TourReservation.class))).thenAnswer(inv -> {
            TourReservation r = inv.getArgument(0);
            r.setId(555L);
            return r;
        });

        ReserveTourCommand cmd = ReserveTourCommand.builder()
                .bookingId(1L)
                .bookingCode("BK-TOUR-1")
                .tourId(100L)
                .departureId(200L)
                .quantity(2)
                .build();

        MessageEnvelope<Object> envelope = MessageEnvelope.<Object>builder()
                .messageId("msg-1")
                .correlationId("saga-1")
                .messageType("RESERVE_TOUR_COMMAND")
                .payload(cmd)
                .build();

        tourCommandHandler.onTourCommand(envelope);

        assertThat(departure.getAvailableSeats()).isEqualTo(8);
        verify(tourDepartureRepository, times(1)).save(departure);
        verify(tourReservationRepository, times(1)).save(any(TourReservation.class));

        ArgumentCaptor<Object> captor = ArgumentCaptor.forClass(Object.class);
        verify(outboxPublisher, times(1)).enqueueAndPublish(
                eq("TourReservation"),
                eq("555"),
                eq("TOUR_RESERVED_EVENT"),
                eq(RabbitMQConstants.EXCHANGE_EVENTS),
                eq(RabbitMQConstants.ROUTING_KEY_TOUR_RESERVED),
                captor.capture()
        );

        MessageEnvelope evtEnvelope = (MessageEnvelope) captor.getValue();
        TourReservedEvent evt = (TourReservedEvent) evtEnvelope.getPayload();
        assertThat(evt.getReservationId()).isEqualTo(555L);
        assertThat(evt.getTotalPrice()).isEqualByComparingTo("3000000.00");
    }

    @Test
    @DisplayName("Idempotency: Sending 10 duplicate ReserveTourCommand only decrements seats ONCE (no double deduction)")
    void handleReserveTour_tenDuplicateMessages_deductsSeatsOnlyOnce() {
        String duplicateMsgId = "msg-dup-999";
        Set<String> processedMsgIds = new HashSet<>();

        when(idempotentConsumerService.markProcessedIfNew(eq(duplicateMsgId), eq("TourCommandHandler")))
                .thenAnswer(inv -> processedMsgIds.add(duplicateMsgId));

        TourDeparture departure = TourDeparture.builder()
                .id(200L)
                .availableSeats(10)
                .price(new BigDecimal("1500000.00"))
                .build();

        when(tourDepartureRepository.findById(200L)).thenReturn(Optional.of(departure));
        when(tourReservationRepository.save(any(TourReservation.class))).thenAnswer(inv -> {
            TourReservation r = inv.getArgument(0);
            r.setId(777L);
            return r;
        });

        ReserveTourCommand cmd = ReserveTourCommand.builder()
                .bookingId(2L)
                .bookingCode("BK-DUP-01")
                .tourId(100L)
                .departureId(200L)
                .quantity(2)
                .build();

        MessageEnvelope<Object> envelope = MessageEnvelope.<Object>builder()
                .messageId(duplicateMsgId)
                .correlationId("saga-dup-1")
                .messageType("RESERVE_TOUR_COMMAND")
                .payload(cmd)
                .build();

        // Simulate 10 duplicate deliveries of the exact same message
        for (int i = 0; i < 10; i++) {
            tourCommandHandler.onTourCommand(envelope);
        }

        // Available seats should ONLY be decremented once (10 - 2 = 8), NOT 10 - (2 * 10) = -10!
        assertThat(departure.getAvailableSeats()).isEqualTo(8);
        verify(tourDepartureRepository, times(1)).save(departure);
        verify(tourReservationRepository, times(1)).save(any(TourReservation.class));
        verify(outboxPublisher, times(1)).enqueueAndPublish(any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should process ConfirmTourCommand and update reservation status to CONFIRMED")
    void handleConfirmTour_success() {
        when(idempotentConsumerService.markProcessedIfNew("msg-confirm", "TourCommandHandler")).thenReturn(true);

        TourReservation reservation = TourReservation.builder()
                .id(555L)
                .bookingId(1L)
                .status(ReservationStatus.PENDING)
                .build();

        when(tourReservationRepository.findByBookingId(1L)).thenReturn(List.of(reservation));

        ConfirmTourCommand cmd = ConfirmTourCommand.builder()
                .bookingId(1L)
                .bookingCode("BK-TOUR-1")
                .build();

        MessageEnvelope<Object> envelope = MessageEnvelope.<Object>builder()
                .messageId("msg-confirm")
                .messageType("CONFIRM_TOUR_COMMAND")
                .payload(cmd)
                .build();

        tourCommandHandler.onTourCommand(envelope);

        assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.CONFIRMED);
        verify(tourReservationRepository, times(1)).save(reservation);
    }

    @Test
    @DisplayName("Should process ReleaseTourCommand, revert seats and set status CANCELLED")
    void handleReleaseTour_success() {
        when(idempotentConsumerService.markProcessedIfNew("msg-release", "TourCommandHandler")).thenReturn(true);

        TourReservation reservation = TourReservation.builder()
                .id(555L)
                .bookingId(1L)
                .status(ReservationStatus.PENDING)
                .seatsBooked(2)
                .build();

        TourDeparture departure = TourDeparture.builder()
                .id(200L)
                .availableSeats(8)
                .build();

        when(tourReservationRepository.findByBookingId(1L)).thenReturn(List.of(reservation));
        when(tourDepartureRepository.findById(200L)).thenReturn(Optional.of(departure));

        ReleaseTourCommand cmd = ReleaseTourCommand.builder()
                .bookingId(1L)
                .bookingCode("BK-TOUR-1")
                .departureId(200L)
                .quantity(2)
                .build();

        MessageEnvelope<Object> envelope = MessageEnvelope.<Object>builder()
                .messageId("msg-release")
                .messageType("RELEASE_TOUR_COMMAND")
                .payload(cmd)
                .build();

        tourCommandHandler.onTourCommand(envelope);

        assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
        assertThat(departure.getAvailableSeats()).isEqualTo(10);
        verify(tourDepartureRepository, times(1)).save(departure);
    }
}

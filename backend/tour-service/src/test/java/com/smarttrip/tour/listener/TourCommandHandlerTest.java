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
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

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
    private RabbitTemplate rabbitTemplate;

    @Spy
    private ObjectMapper messagingObjectMapper = new ObjectMapper();

    @InjectMocks
    private TourCommandHandler tourCommandHandler;

    @Test
    @DisplayName("Should process ReserveTourCommand, decrement seats and emit TourReservedEvent")
    void handleReserveTour_success() {
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

        ArgumentCaptor<MessageEnvelope> captor = ArgumentCaptor.forClass(MessageEnvelope.class);
        verify(rabbitTemplate, times(1)).convertAndSend(
                eq(RabbitMQConstants.EXCHANGE_EVENTS),
                eq(RabbitMQConstants.ROUTING_KEY_TOUR_RESERVED),
                captor.capture()
        );

        TourReservedEvent evt = (TourReservedEvent) captor.getValue().getPayload();
        assertThat(evt.getReservationId()).isEqualTo(555L);
        assertThat(evt.getTotalPrice()).isEqualByComparingTo("3000000.00");
    }

    @Test
    @DisplayName("Should process ConfirmTourCommand and update reservation status to CONFIRMED")
    void handleConfirmTour_success() {
        TourReservation reservation = TourReservation.builder()
                .id(1L)
                .bookingId(10L)
                .status(ReservationStatus.PENDING)
                .build();

        when(tourReservationRepository.findByBookingId(10L)).thenReturn(List.of(reservation));

        ConfirmTourCommand cmd = ConfirmTourCommand.builder()
                .bookingId(10L)
                .bookingCode("BK-10")
                .build();

        MessageEnvelope<Object> envelope = MessageEnvelope.<Object>builder()
                .messageType("CONFIRM_TOUR_COMMAND")
                .payload(cmd)
                .build();

        tourCommandHandler.onTourCommand(envelope);

        assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.CONFIRMED);
        verify(tourReservationRepository, times(1)).save(reservation);
    }
}

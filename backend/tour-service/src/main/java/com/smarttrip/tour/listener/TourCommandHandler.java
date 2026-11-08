package com.smarttrip.tour.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttrip.messaging.command.ConfirmTourCommand;
import com.smarttrip.messaging.command.ReleaseTourCommand;
import com.smarttrip.messaging.command.ReserveTourCommand;
import com.smarttrip.messaging.constant.RabbitMQConstants;
import com.smarttrip.messaging.envelope.MessageEnvelope;
import com.smarttrip.messaging.event.TourReserveFailedEvent;
import com.smarttrip.messaging.event.TourReservedEvent;
import com.smarttrip.tour.entity.TourDeparture;
import com.smarttrip.tour.entity.TourReservation;
import com.smarttrip.tour.enums.ReservationStatus;
import com.smarttrip.tour.idempotency.IdempotentConsumerService;
import com.smarttrip.tour.outbox.OutboxPublisher;
import com.smarttrip.tour.repository.TourDepartureRepository;
import com.smarttrip.tour.repository.TourReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class TourCommandHandler {

    private final TourDepartureRepository tourDepartureRepository;
    private final TourReservationRepository tourReservationRepository;
    private final IdempotentConsumerService idempotentConsumerService;
    private final OutboxPublisher outboxPublisher;
    private final ObjectMapper messagingObjectMapper;

    @RabbitListener(queues = RabbitMQConstants.QUEUE_TOUR_COMMANDS)
    @Transactional
    public void onTourCommand(MessageEnvelope<Object> envelope) {
        if (envelope == null || envelope.getMessageType() == null) {
            return;
        }

        // Idempotency check: Ignore duplicate messages
        if (!idempotentConsumerService.markProcessedIfNew(envelope.getMessageId(), "TourCommandHandler")) {
            log.warn("TourCommandHandler skipped duplicate command messageId={}", envelope.getMessageId());
            return;
        }

        log.info("Tour Service received command: {}", envelope.getMessageType());

        switch (envelope.getMessageType()) {
            case "RESERVE_TOUR_COMMAND" -> {
                ReserveTourCommand cmd = messagingObjectMapper.convertValue(envelope.getPayload(), ReserveTourCommand.class);
                handleReserveTour(cmd, envelope.getCorrelationId(), envelope.getMessageId());
            }
            case "CONFIRM_TOUR_COMMAND" -> {
                ConfirmTourCommand cmd = messagingObjectMapper.convertValue(envelope.getPayload(), ConfirmTourCommand.class);
                handleConfirmTour(cmd);
            }
            case "RELEASE_TOUR_COMMAND" -> {
                ReleaseTourCommand cmd = messagingObjectMapper.convertValue(envelope.getPayload(), ReleaseTourCommand.class);
                handleReleaseTour(cmd);
            }
            default -> log.debug("Tour Service ignored command: {}", envelope.getMessageType());
        }
    }

    private void handleReserveTour(ReserveTourCommand cmd, String correlationId, String causationId) {
        Optional<TourDeparture> depOpt = tourDepartureRepository.findById(cmd.getDepartureId());
        if (depOpt.isEmpty()) {
            publishReserveFailed(cmd, "Departure not found: " + cmd.getDepartureId(), correlationId, causationId);
            return;
        }

        TourDeparture dep = depOpt.get();
        if (dep.getAvailableSeats() < cmd.getQuantity()) {
            publishReserveFailed(cmd, "Not enough available seats", correlationId, causationId);
            return;
        }

        dep.setAvailableSeats(dep.getAvailableSeats() - cmd.getQuantity());
        tourDepartureRepository.save(dep);

        TourReservation res = TourReservation.builder()
                .bookingId(cmd.getBookingId())
                .departure(dep)
                .seatsBooked(cmd.getQuantity())
                .status(ReservationStatus.PENDING)
                .build();
        TourReservation savedRes = tourReservationRepository.save(res);

        BigDecimal unitPrice = dep.getPrice();
        BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(cmd.getQuantity()));

        TourReservedEvent event = TourReservedEvent.builder()
                .bookingId(cmd.getBookingId())
                .bookingCode(cmd.getBookingCode())
                .reservationId(savedRes.getId())
                .tourId(cmd.getTourId())
                .departureId(cmd.getDepartureId())
                .quantity(cmd.getQuantity())
                .unitPrice(unitPrice)
                .totalPrice(totalPrice)
                .build();

        MessageEnvelope<TourReservedEvent> evtEnvelope = MessageEnvelope.of(
                "TOUR_RESERVED_EVENT", event, correlationId, causationId
        );

        outboxPublisher.enqueueAndPublish(
                "TourReservation",
                savedRes.getId().toString(),
                "TOUR_RESERVED_EVENT",
                RabbitMQConstants.EXCHANGE_EVENTS,
                RabbitMQConstants.ROUTING_KEY_TOUR_RESERVED,
                evtEnvelope
        );
        log.info("Tour reserved successfully for booking {}. Emitted TourReservedEvent via outbox.", cmd.getBookingCode());
    }

    private void handleConfirmTour(ConfirmTourCommand cmd) {
        tourReservationRepository.findByBookingId(cmd.getBookingId()).forEach(r -> {
            r.setStatus(ReservationStatus.CONFIRMED);
            tourReservationRepository.save(r);
        });
        log.info("Confirmed tour reservation for booking {}", cmd.getBookingCode());
    }

    private void handleReleaseTour(ReleaseTourCommand cmd) {
        tourReservationRepository.findByBookingId(cmd.getBookingId()).forEach(r -> {
            r.setStatus(ReservationStatus.CANCELLED);
            tourReservationRepository.save(r);
        });
        tourDepartureRepository.findById(cmd.getDepartureId()).ifPresent(dep -> {
            dep.setAvailableSeats(dep.getAvailableSeats() + cmd.getQuantity());
            tourDepartureRepository.save(dep);
        });
        log.info("Released tour seats for booking {}", cmd.getBookingCode());
    }

    private void publishReserveFailed(ReserveTourCommand cmd, String reason, String correlationId, String causationId) {
        TourReserveFailedEvent event = TourReserveFailedEvent.builder()
                .bookingId(cmd.getBookingId())
                .bookingCode(cmd.getBookingCode())
                .tourId(cmd.getTourId())
                .departureId(cmd.getDepartureId())
                .reason(reason)
                .build();

        MessageEnvelope<TourReserveFailedEvent> evtEnvelope = MessageEnvelope.of(
                "TOUR_RESERVE_FAILED_EVENT", event, correlationId, causationId
        );

        outboxPublisher.enqueueAndPublish(
                "TourReservation",
                cmd.getBookingId().toString(),
                "TOUR_RESERVE_FAILED_EVENT",
                RabbitMQConstants.EXCHANGE_EVENTS,
                RabbitMQConstants.ROUTING_KEY_TOUR_RESERVE_FAILED,
                evtEnvelope
        );
        log.warn("Tour reservation failed for booking {}: {}", cmd.getBookingCode(), reason);
    }
}

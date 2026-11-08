package com.smarttrip.booking.saga.impl;

import com.smarttrip.booking.entity.Booking;
import com.smarttrip.booking.entity.BookingHotelDetail;
import com.smarttrip.booking.entity.BookingItem;
import com.smarttrip.booking.entity.SagaInstance;
import com.smarttrip.booking.entity.SagaStep;
import com.smarttrip.booking.exception.ResourceNotFoundException;
import com.smarttrip.booking.repository.BookingRepository;
import com.smarttrip.booking.repository.SagaInstanceRepository;
import com.smarttrip.booking.repository.SagaStepRepository;
import com.smarttrip.booking.saga.BookingSagaOrchestrator;
import com.smarttrip.messaging.command.*;
import com.smarttrip.messaging.constant.RabbitMQConstants;
import com.smarttrip.messaging.envelope.MessageEnvelope;
import com.smarttrip.messaging.event.HotelReservedEvent;
import com.smarttrip.messaging.event.PaymentAuthorizedEvent;
import com.smarttrip.messaging.event.TourReservedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingSagaOrchestratorImpl implements BookingSagaOrchestrator {

    private final RabbitTemplate rabbitTemplate;
    private final BookingRepository bookingRepository;
    private final SagaInstanceRepository sagaInstanceRepository;
    private final SagaStepRepository sagaStepRepository;

    @Override
    @Transactional
    public void startSaga(Booking booking, SagaInstance saga) {
        log.info("Starting Booking Saga {} for booking {}", saga.getSagaId(), booking.getBookingCode());

        saga.setStatus("PROCESSING");
        saga.setCurrentStep("RESERVE_TOUR");
        sagaInstanceRepository.save(saga);

        // Record step
        recordStep(saga, "RESERVE_TOUR", "COMMAND", "PENDING");

        // Send ReserveTourCommand
        BookingItem tourItem = booking.getItems().isEmpty() ? null : booking.getItems().get(0);
        if (tourItem != null) {
            ReserveTourCommand cmd = ReserveTourCommand.builder()
                    .bookingId(booking.getId())
                    .bookingCode(booking.getBookingCode())
                    .tourId(tourItem.getTourId())
                    .departureId(tourItem.getDepartureId())
                    .quantity(tourItem.getQuantity())
                    .build();

            MessageEnvelope<ReserveTourCommand> envelope = MessageEnvelope.of(
                    "RESERVE_TOUR_COMMAND", cmd, saga.getSagaId()
            );

            rabbitTemplate.convertAndSend(
                    RabbitMQConstants.EXCHANGE_COMMANDS,
                    RabbitMQConstants.ROUTING_KEY_RESERVE_TOUR,
                    envelope
            );
            log.info("Sent ReserveTourCommand for booking {}", booking.getBookingCode());
        }
    }

    @Override
    @Transactional
    public void handleTourReserved(MessageEnvelope<TourReservedEvent> envelope) {
        String sagaId = envelope.getCorrelationId();
        TourReservedEvent event = envelope.getPayload();
        log.info("Saga {}: Received TourReservedEvent for booking {}", sagaId, event.getBookingCode());

        SagaInstance saga = findSaga(sagaId, event.getBookingId());
        completeStep(saga, "RESERVE_TOUR");

        Booking booking = bookingRepository.findById(event.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + event.getBookingId()));

        boolean hasHotel = booking.getHotelDetails() != null && !booking.getHotelDetails().isEmpty();

        if (hasHotel) {
            // Next step: Reserve Hotel
            saga.setCurrentStep("RESERVE_HOTEL");
            sagaInstanceRepository.save(saga);
            recordStep(saga, "RESERVE_HOTEL", "COMMAND", "PENDING");

            BookingHotelDetail hotelDetail = booking.getHotelDetails().get(0);
            ReserveHotelCommand cmd = ReserveHotelCommand.builder()
                    .bookingId(booking.getId())
                    .bookingCode(booking.getBookingCode())
                    .hotelId(hotelDetail.getHotelId())
                    .roomTypeId(hotelDetail.getRoomTypeId())
                    .checkInDate(hotelDetail.getCheckInDate())
                    .checkOutDate(hotelDetail.getCheckOutDate())
                    .roomQuantity(hotelDetail.getRoomQuantity())
                    .build();

            MessageEnvelope<ReserveHotelCommand> hotelEnvelope = MessageEnvelope.of(
                    "RESERVE_HOTEL_COMMAND", cmd, saga.getSagaId(), envelope.getMessageId()
            );

            rabbitTemplate.convertAndSend(
                    RabbitMQConstants.EXCHANGE_COMMANDS,
                    RabbitMQConstants.ROUTING_KEY_RESERVE_HOTEL,
                    hotelEnvelope
            );
            log.info("Sent ReserveHotelCommand for booking {}", booking.getBookingCode());
        } else {
            // No hotel: directly authorize payment
            triggerAuthorizePayment(saga, booking, envelope.getMessageId());
        }
    }

    @Override
    @Transactional
    public void handleHotelReserved(MessageEnvelope<HotelReservedEvent> envelope) {
        String sagaId = envelope.getCorrelationId();
        HotelReservedEvent event = envelope.getPayload();
        log.info("Saga {}: Received HotelReservedEvent for booking {}", sagaId, event.getBookingCode());

        SagaInstance saga = findSaga(sagaId, event.getBookingId());
        completeStep(saga, "RESERVE_HOTEL");

        Booking booking = bookingRepository.findById(event.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + event.getBookingId()));

        triggerAuthorizePayment(saga, booking, envelope.getMessageId());
    }

    @Override
    @Transactional
    public void handlePaymentAuthorized(MessageEnvelope<PaymentAuthorizedEvent> envelope) {
        String sagaId = envelope.getCorrelationId();
        PaymentAuthorizedEvent event = envelope.getPayload();
        log.info("Saga {}: Received PaymentAuthorizedEvent for booking {}", sagaId, event.getBookingCode());

        SagaInstance saga = findSaga(sagaId, event.getBookingId());
        completeStep(saga, "AUTHORIZE_PAYMENT");

        Booking booking = bookingRepository.findById(event.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + event.getBookingId()));

        // Step 5: Confirm resources
        recordStep(saga, "CONFIRM_RESOURCES", "COMMAND", "PENDING");

        BookingItem tourItem = booking.getItems().isEmpty() ? null : booking.getItems().get(0);
        if (tourItem != null) {
            ConfirmTourCommand confirmTourCmd = ConfirmTourCommand.builder()
                    .bookingId(booking.getId())
                    .bookingCode(booking.getBookingCode())
                    .tourId(tourItem.getTourId())
                    .departureId(tourItem.getDepartureId())
                    .quantity(tourItem.getQuantity())
                    .build();
            rabbitTemplate.convertAndSend(
                    RabbitMQConstants.EXCHANGE_COMMANDS,
                    RabbitMQConstants.ROUTING_KEY_CONFIRM_TOUR,
                    MessageEnvelope.of("CONFIRM_TOUR_COMMAND", confirmTourCmd, saga.getSagaId())
            );
        }

        if (booking.getHotelDetails() != null && !booking.getHotelDetails().isEmpty()) {
            BookingHotelDetail hotelDetail = booking.getHotelDetails().get(0);
            ConfirmHotelCommand confirmHotelCmd = ConfirmHotelCommand.builder()
                    .bookingId(booking.getId())
                    .bookingCode(booking.getBookingCode())
                    .hotelId(hotelDetail.getHotelId())
                    .roomTypeId(hotelDetail.getRoomTypeId())
                    .checkInDate(hotelDetail.getCheckInDate())
                    .checkOutDate(hotelDetail.getCheckOutDate())
                    .roomQuantity(hotelDetail.getRoomQuantity())
                    .build();
            rabbitTemplate.convertAndSend(
                    RabbitMQConstants.EXCHANGE_COMMANDS,
                    RabbitMQConstants.ROUTING_KEY_CONFIRM_HOTEL,
                    MessageEnvelope.of("CONFIRM_HOTEL_COMMAND", confirmHotelCmd, saga.getSagaId())
            );
        }
        completeStep(saga, "CONFIRM_RESOURCES");

        // Step 6: Capture Payment
        recordStep(saga, "CAPTURE_PAYMENT", "COMMAND", "PENDING");
        CapturePaymentCommand captureCmd = CapturePaymentCommand.builder()
                .bookingId(booking.getId())
                .bookingCode(booking.getBookingCode())
                .userId(booking.getCustomerId())
                .amount(booking.getTotalAmount())
                .build();
        rabbitTemplate.convertAndSend(
                RabbitMQConstants.EXCHANGE_COMMANDS,
                RabbitMQConstants.ROUTING_KEY_CAPTURE_PAYMENT,
                MessageEnvelope.of("CAPTURE_PAYMENT_COMMAND", captureCmd, saga.getSagaId())
        );
        completeStep(saga, "CAPTURE_PAYMENT");

        // Step 7: Finalize Booking and Saga
        booking.setStatus("CONFIRMED");
        bookingRepository.save(booking);

        saga.setStatus("COMPLETED");
        saga.setCurrentStep("COMPLETED");
        saga.setCompletedAt(LocalDateTime.now());
        sagaInstanceRepository.save(saga);

        log.info("Saga {} successfully COMPLETED. Booking {} is now CONFIRMED!",
                saga.getSagaId(), booking.getBookingCode());
    }

    @Override
    @Transactional(readOnly = true)
    public SagaInstance getSagaByBookingId(Long bookingId) {
        return sagaInstanceRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Saga not found for booking: " + bookingId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SagaStep> getSagaSteps(String sagaId) {
        return sagaStepRepository.findBySagaInstanceSagaId(sagaId);
    }

    private void triggerAuthorizePayment(SagaInstance saga, Booking booking, String causationId) {
        saga.setCurrentStep("AUTHORIZE_PAYMENT");
        sagaInstanceRepository.save(saga);
        recordStep(saga, "AUTHORIZE_PAYMENT", "COMMAND", "PENDING");

        AuthorizePaymentCommand cmd = AuthorizePaymentCommand.builder()
                .bookingId(booking.getId())
                .bookingCode(booking.getBookingCode())
                .userId(booking.getCustomerId())
                .amount(booking.getTotalAmount())
                .currency(booking.getCurrency())
                .build();

        MessageEnvelope<AuthorizePaymentCommand> payEnvelope = MessageEnvelope.of(
                "AUTHORIZE_PAYMENT_COMMAND", cmd, saga.getSagaId(), causationId
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConstants.EXCHANGE_COMMANDS,
                RabbitMQConstants.ROUTING_KEY_AUTHORIZE_PAYMENT,
                payEnvelope
        );
        log.info("Sent AuthorizePaymentCommand for booking {}: amount={}",
                booking.getBookingCode(), booking.getTotalAmount());
    }

    private SagaInstance findSaga(String sagaId, Long bookingId) {
        if (sagaId != null && !sagaId.isBlank()) {
            var opt = sagaInstanceRepository.findBySagaId(sagaId);
            if (opt.isPresent()) return opt.get();
        }
        return sagaInstanceRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Saga not found for booking: " + bookingId));
    }

    private void recordStep(SagaInstance saga, String stepName, String actionType, String status) {
        SagaStep step = sagaStepRepository.findBySagaInstanceSagaIdAndStepName(saga.getSagaId(), stepName)
                .orElseGet(() -> SagaStep.builder()
                        .sagaInstance(saga)
                        .stepName(stepName)
                        .actionType(actionType)
                        .build());
        step.setStatus(status);
        step.setStartedAt(LocalDateTime.now());
        sagaStepRepository.save(step);
    }

    private void completeStep(SagaInstance saga, String stepName) {
        sagaStepRepository.findBySagaInstanceSagaIdAndStepName(saga.getSagaId(), stepName)
                .ifPresent(step -> {
                    step.setStatus("COMPLETED");
                    step.setCompletedAt(LocalDateTime.now());
                    sagaStepRepository.save(step);
                });
    }
}

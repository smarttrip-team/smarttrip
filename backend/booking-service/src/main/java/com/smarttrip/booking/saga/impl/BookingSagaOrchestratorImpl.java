package com.smarttrip.booking.saga.impl;

import com.smarttrip.booking.entity.Booking;
import com.smarttrip.booking.entity.BookingHotelDetail;
import com.smarttrip.booking.entity.BookingItem;
import com.smarttrip.booking.entity.SagaInstance;
import com.smarttrip.booking.entity.SagaStep;
import com.smarttrip.booking.exception.ResourceNotFoundException;
import com.smarttrip.booking.outbox.OutboxPublisher;
import com.smarttrip.booking.repository.BookingRepository;
import com.smarttrip.booking.repository.SagaInstanceRepository;
import com.smarttrip.booking.repository.SagaStepRepository;
import com.smarttrip.booking.saga.BookingSagaOrchestrator;
import com.smarttrip.messaging.command.*;
import com.smarttrip.messaging.constant.RabbitMQConstants;
import com.smarttrip.messaging.envelope.MessageEnvelope;
import com.smarttrip.messaging.event.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingSagaOrchestratorImpl implements BookingSagaOrchestrator {

    private final OutboxPublisher outboxPublisher;
    private final BookingRepository bookingRepository;
    private final SagaInstanceRepository sagaInstanceRepository;
    private final SagaStepRepository sagaStepRepository;

    @Override
    @Transactional
    public void startSaga(Booking booking, SagaInstance saga) {
        log.info("Starting Booking Saga {} for booking {}", saga.getSagaId(), booking.getBookingCode());

        SagaInstance managedSaga = (saga.getId() != null) ? saga : sagaInstanceRepository.findBySagaId(saga.getSagaId()).orElse(saga);
        managedSaga.setStatus("PROCESSING");
        managedSaga.setCurrentStep("RESERVE_TOUR");
        saga = sagaInstanceRepository.save(managedSaga);

        // Record step
        recordStep(saga, "RESERVE_TOUR", "COMMAND", "PENDING");

        // Send ReserveTourCommand via Transactional Outbox
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

            outboxPublisher.enqueueAndPublish(
                    "BOOKING",
                    booking.getId().toString(),
                    "RESERVE_TOUR_COMMAND",
                    RabbitMQConstants.EXCHANGE_COMMANDS,
                    RabbitMQConstants.ROUTING_KEY_RESERVE_TOUR,
                    envelope
            );
            log.info("Enqueued ReserveTourCommand via Outbox for booking {}", booking.getBookingCode());
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

            outboxPublisher.enqueueAndPublish(
                    "BOOKING",
                    booking.getId().toString(),
                    "RESERVE_HOTEL_COMMAND",
                    RabbitMQConstants.EXCHANGE_COMMANDS,
                    RabbitMQConstants.ROUTING_KEY_RESERVE_HOTEL,
                    hotelEnvelope
            );
            log.info("Enqueued ReserveHotelCommand via Outbox for booking {}", booking.getBookingCode());
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
        if (booking.getIdempotencyKey() != null && (
                booking.getIdempotencyKey().contains("FAIL_AFTER_PAYMENT") ||
                booking.getIdempotencyKey().contains("FAIL_CONFIRM") ||
                booking.getIdempotencyKey().contains("FAIL_AFTER_HOLD"))) {
            log.warn("Saga {}: Simulating failure at CONFIRM_RESOURCES for booking {}", sagaId, booking.getBookingCode());
            recordStep(saga, "CONFIRM_RESOURCES", "COMMAND", "PENDING");
            failStep(saga, "CONFIRM_RESOURCES", "Mô phỏng lỗi: Đối tác từ chối xác nhận tài nguyên (Resource unavailable) - Kích hoạt bồi hoàn toàn bộ và hoàn trả tiền ví");

            // 1. Compensate Payment (Void held amount in wallet)
            compensatePayment(saga, booking, envelope.getMessageId());

            // 2. Compensate Tour (Release held seats)
            compensateTour(saga, booking, envelope.getMessageId());

            // 3. Compensate Hotel if applicable
            if (booking.getHotelDetails() != null && !booking.getHotelDetails().isEmpty()) {
                compensateHotel(saga, booking, envelope.getMessageId());
            }

            booking.setStatus("FAILED");
            bookingRepository.save(booking);

            saga.setStatus("COMPENSATED");
            saga.setCurrentStep("COMPENSATED");
            saga.setFailureReason("Lỗi xác nhận tài nguyên - Đã hoàn trả tiền ví và giải phóng chỗ ngồi");
            saga.setCompletedAt(LocalDateTime.now());
            sagaInstanceRepository.save(saga);

            log.warn("Saga {} COMPENSATED (Payment voided & refunded, Tour released). Booking {} status set to FAILED.",
                    saga.getSagaId(), booking.getBookingCode());
            return;
        }

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
            outboxPublisher.enqueueAndPublish(
                    "BOOKING",
                    booking.getId().toString(),
                    "CONFIRM_TOUR_COMMAND",
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
            outboxPublisher.enqueueAndPublish(
                    "BOOKING",
                    booking.getId().toString(),
                    "CONFIRM_HOTEL_COMMAND",
                    RabbitMQConstants.EXCHANGE_COMMANDS,
                    RabbitMQConstants.ROUTING_KEY_CONFIRM_HOTEL,
                    MessageEnvelope.of("CONFIRM_HOTEL_COMMAND", confirmHotelCmd, saga.getSagaId())
            );
        }
        completeStep(saga, "CONFIRM_RESOURCES");

        // Step 6: Capture Payment & Multi-Party Settlement
        recordStep(saga, "CAPTURE_PAYMENT", "COMMAND", "PENDING");
        BigDecimal tourSubtotal = booking.getItems().isEmpty()
                ? booking.getTotalAmount()
                : booking.getItems().get(0).getSubtotal();
        BigDecimal hotelSubtotal = BigDecimal.ZERO;
        if (booking.getHotelDetails() != null && !booking.getHotelDetails().isEmpty()) {
            hotelSubtotal = booking.getHotelDetails().stream()
                    .map(hd -> hd.getPriceSnapshot() != null
                            ? hd.getPriceSnapshot().multiply(BigDecimal.valueOf(hd.getRoomQuantity()))
                            : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        CapturePaymentCommand captureCmd = CapturePaymentCommand.builder()
                .bookingId(booking.getId())
                .bookingCode(booking.getBookingCode())
                .userId(booking.getCustomerId())
                .amount(booking.getTotalAmount())
                .operatorId(2L)
                .tourAmount(tourSubtotal)
                .hotelierId(3L)
                .hotelAmount(hotelSubtotal)
                .build();
        outboxPublisher.enqueueAndPublish(
                "BOOKING",
                booking.getId().toString(),
                "CAPTURE_PAYMENT_COMMAND",
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
    @Transactional
    public void handleTourReserveFailed(MessageEnvelope<TourReserveFailedEvent> envelope) {
        String sagaId = envelope.getCorrelationId();
        TourReserveFailedEvent event = envelope.getPayload();
        log.warn("Saga {}: Received TourReserveFailedEvent for booking {}: {}", sagaId, event.getBookingCode(), event.getReason());

        SagaInstance saga = findSaga(sagaId, event.getBookingId());
        failStep(saga, "RESERVE_TOUR", event.getReason());

        Booking booking = bookingRepository.findById(event.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + event.getBookingId()));

        booking.setStatus("FAILED");
        bookingRepository.save(booking);

        saga.setStatus("COMPENSATED");
        saga.setCurrentStep("FAILED");
        saga.setFailureReason(event.getReason());
        saga.setCompletedAt(LocalDateTime.now());
        sagaInstanceRepository.save(saga);

        log.warn("Saga {} marked COMPENSATED. Booking {} status set to FAILED.", saga.getSagaId(), booking.getBookingCode());
    }

    @Override
    @Transactional
    public void handleHotelReserveFailed(MessageEnvelope<HotelReserveFailedEvent> envelope) {
        String sagaId = envelope.getCorrelationId();
        HotelReserveFailedEvent event = envelope.getPayload();
        log.warn("Saga {}: Received HotelReserveFailedEvent for booking {}: {}", sagaId, event.getBookingCode(), event.getReason());

        SagaInstance saga = findSaga(sagaId, event.getBookingId());
        failStep(saga, "RESERVE_HOTEL", event.getReason());

        Booking booking = bookingRepository.findById(event.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + event.getBookingId()));

        // Compensate Tour
        compensateTour(saga, booking, envelope.getMessageId());

        booking.setStatus("FAILED");
        bookingRepository.save(booking);

        saga.setStatus("COMPENSATED");
        saga.setCurrentStep("COMPENSATED");
        saga.setFailureReason(event.getReason());
        saga.setCompletedAt(LocalDateTime.now());
        sagaInstanceRepository.save(saga);

        log.warn("Saga {} COMPENSATED (Tour released). Booking {} status set to FAILED.", saga.getSagaId(), booking.getBookingCode());
    }

    @Override
    @Transactional
    public void handlePaymentAuthorizeFailed(MessageEnvelope<PaymentAuthorizeFailedEvent> envelope) {
        String sagaId = envelope.getCorrelationId();
        PaymentAuthorizeFailedEvent event = envelope.getPayload();
        log.warn("Saga {}: Received PaymentAuthorizeFailedEvent for booking {}: {}", sagaId, event.getBookingCode(), event.getReason());

        SagaInstance saga = findSaga(sagaId, event.getBookingId());
        failStep(saga, "AUTHORIZE_PAYMENT", event.getReason());

        Booking booking = bookingRepository.findById(event.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + event.getBookingId()));

        // Compensate Tour
        compensateTour(saga, booking, envelope.getMessageId());

        // Compensate Hotel if applicable
        if (booking.getHotelDetails() != null && !booking.getHotelDetails().isEmpty()) {
            compensateHotel(saga, booking, envelope.getMessageId());
        }

        booking.setStatus("FAILED");
        bookingRepository.save(booking);

        saga.setStatus("COMPENSATED");
        saga.setCurrentStep("COMPENSATED");
        saga.setFailureReason(event.getReason());
        saga.setCompletedAt(LocalDateTime.now());
        sagaInstanceRepository.save(saga);

        log.warn("Saga {} COMPENSATED (Tour and Hotel released). Booking {} status set to FAILED.", saga.getSagaId(), booking.getBookingCode());
    }

    @Override
    @Transactional
    public SagaInstance cancelBooking(Booking booking) {
        log.info("Starting Cancellation Saga for booking {}", booking.getBookingCode());

        // 1. Create and persist SagaInstance for Cancellation
        SagaInstance saga = SagaInstance.builder()
                .sagaId(UUID.randomUUID().toString())
                .bookingId(booking.getId())
                .sagaType("BOOKING_CANCEL")
                .status("PROCESSING")
                .currentStep("CHECK_CANCELLATION_POLICY")
                .startedAt(LocalDateTime.now())
                .build();
        saga = sagaInstanceRepository.save(saga);

        // 2. Check Cancellation Policy & calculate refund amount
        recordStep(saga, "CHECK_CANCELLATION_POLICY", "ACTION", "PENDING");
        LocalDate departureDate = null;
        if (booking.getItems() != null && !booking.getItems().isEmpty()) {
            departureDate = booking.getItems().get(0).getDepartureDateSnapshot();
        }

        double refundRate = calculateRefundRate(departureDate);
        BigDecimal refundAmount = booking.getTotalAmount().multiply(BigDecimal.valueOf(refundRate))
                .setScale(2, RoundingMode.HALF_UP);
        completeStep(saga, "CHECK_CANCELLATION_POLICY");

        log.info("Booking {} cancellation policy: departureDate={}, refundRate={}%, refundAmount={}",
                booking.getBookingCode(), departureDate, refundRate * 100, refundAmount);

        // 3. Send RefundPaymentCommand via Outbox
        recordStep(saga, "REFUND_PAYMENT", "COMMAND", "PENDING");
        RefundPaymentCommand refundCmd = RefundPaymentCommand.builder()
                .bookingId(booking.getId())
                .bookingCode(booking.getBookingCode())
                .userId(booking.getCustomerId())
                .amount(refundAmount)
                .reason(String.format("Cancellation refund (%.0f%%) for booking %s", refundRate * 100, booking.getBookingCode()))
                .build();

        MessageEnvelope<RefundPaymentCommand> refundEnvelope = MessageEnvelope.of(
                "REFUND_PAYMENT_COMMAND", refundCmd, saga.getSagaId()
        );

        outboxPublisher.enqueueAndPublish(
                "BOOKING",
                booking.getId().toString(),
                "REFUND_PAYMENT_COMMAND",
                RabbitMQConstants.EXCHANGE_COMMANDS,
                RabbitMQConstants.ROUTING_KEY_REFUND_PAYMENT,
                refundEnvelope
        );
        completeStep(saga, "REFUND_PAYMENT");
        log.info("Enqueued RefundPaymentCommand via Outbox for booking {}: amount={}", booking.getBookingCode(), refundAmount);

        // 4. Send ReleaseTourCommand via Outbox
        recordStep(saga, "RELEASE_TOUR", "COMMAND", "PENDING");
        BookingItem tourItem = booking.getItems().isEmpty() ? null : booking.getItems().get(0);
        if (tourItem != null) {
            ReleaseTourCommand releaseTourCmd = ReleaseTourCommand.builder()
                    .bookingId(booking.getId())
                    .bookingCode(booking.getBookingCode())
                    .tourId(tourItem.getTourId())
                    .departureId(tourItem.getDepartureId())
                    .quantity(tourItem.getQuantity())
                    .build();

            MessageEnvelope<ReleaseTourCommand> releaseTourEnvelope = MessageEnvelope.of(
                    "RELEASE_TOUR_COMMAND", releaseTourCmd, saga.getSagaId()
            );

            outboxPublisher.enqueueAndPublish(
                    "BOOKING",
                    booking.getId().toString(),
                    "RELEASE_TOUR_COMMAND",
                    RabbitMQConstants.EXCHANGE_COMMANDS,
                    RabbitMQConstants.ROUTING_KEY_RELEASE_TOUR,
                    releaseTourEnvelope
            );
            log.info("Enqueued ReleaseTourCommand via Outbox for booking {}", booking.getBookingCode());
        }
        completeStep(saga, "RELEASE_TOUR");

        // 5. Send ReleaseHotelCommand via Outbox (if applicable)
        if (booking.getHotelDetails() != null && !booking.getHotelDetails().isEmpty()) {
            recordStep(saga, "RELEASE_HOTEL", "COMMAND", "PENDING");
            BookingHotelDetail hotelDetail = booking.getHotelDetails().get(0);
            ReleaseHotelCommand releaseHotelCmd = ReleaseHotelCommand.builder()
                    .bookingId(booking.getId())
                    .bookingCode(booking.getBookingCode())
                    .hotelId(hotelDetail.getHotelId())
                    .roomTypeId(hotelDetail.getRoomTypeId())
                    .checkInDate(hotelDetail.getCheckInDate())
                    .checkOutDate(hotelDetail.getCheckOutDate())
                    .roomQuantity(hotelDetail.getRoomQuantity())
                    .build();

            MessageEnvelope<ReleaseHotelCommand> releaseHotelEnvelope = MessageEnvelope.of(
                    "RELEASE_HOTEL_COMMAND", releaseHotelCmd, saga.getSagaId()
            );

            outboxPublisher.enqueueAndPublish(
                    "BOOKING",
                    booking.getId().toString(),
                    "RELEASE_HOTEL_COMMAND",
                    RabbitMQConstants.EXCHANGE_COMMANDS,
                    RabbitMQConstants.ROUTING_KEY_RELEASE_HOTEL,
                    releaseHotelEnvelope
            );
            completeStep(saga, "RELEASE_HOTEL");
            log.info("Enqueued ReleaseHotelCommand via Outbox for booking {}", booking.getBookingCode());
        }

        // 6. Complete Saga
        saga.setStatus("COMPLETED");
        saga.setCurrentStep("COMPLETED");
        saga.setCompletedAt(LocalDateTime.now());
        sagaInstanceRepository.save(saga);

        log.info("Cancellation Saga {} completed successfully for booking {}", saga.getSagaId(), booking.getBookingCode());
        return saga;
    }

    private double calculateRefundRate(LocalDate departureDate) {
        if (departureDate == null) {
            return 1.0;
        }
        long daysUntilDeparture = ChronoUnit.DAYS.between(LocalDate.now(), departureDate);
        if (daysUntilDeparture > 7) {
            return 1.0;
        } else if (daysUntilDeparture >= 3) {
            return 0.5;
        } else {
            return 0.0;
        }
    }

    private void compensateTour(SagaInstance saga, Booking booking, String causationId) {
        recordStep(saga, "COMPENSATE_TOUR", "COMPENSATION", "PENDING");
        BookingItem tourItem = booking.getItems().isEmpty() ? null : booking.getItems().get(0);
        if (tourItem != null) {
            ReleaseTourCommand releaseCmd = ReleaseTourCommand.builder()
                    .bookingId(booking.getId())
                    .bookingCode(booking.getBookingCode())
                    .tourId(tourItem.getTourId())
                    .departureId(tourItem.getDepartureId())
                    .quantity(tourItem.getQuantity())
                    .build();

            MessageEnvelope<ReleaseTourCommand> releaseEnvelope = MessageEnvelope.of(
                    "RELEASE_TOUR_COMMAND", releaseCmd, saga.getSagaId(), causationId
            );

            outboxPublisher.enqueueAndPublish(
                    "BOOKING",
                    booking.getId().toString(),
                    "RELEASE_TOUR_COMMAND",
                    RabbitMQConstants.EXCHANGE_COMMANDS,
                    RabbitMQConstants.ROUTING_KEY_RELEASE_TOUR,
                    releaseEnvelope
            );
            log.info("Enqueued ReleaseTourCommand via Outbox for booking {}", booking.getBookingCode());
        }
        completeStep(saga, "COMPENSATE_TOUR");
    }

    private void compensatePayment(SagaInstance saga, Booking booking, String causationId) {
        recordStep(saga, "COMPENSATE_PAYMENT", "COMPENSATION", "PENDING");
        VoidPaymentCommand voidCmd = VoidPaymentCommand.builder()
                .bookingId(booking.getId())
                .bookingCode(booking.getBookingCode())
                .userId(booking.getCustomerId())
                .amount(booking.getTotalAmount())
                .build();

        MessageEnvelope<VoidPaymentCommand> voidEnvelope = MessageEnvelope.of(
                "VOID_PAYMENT_COMMAND", voidCmd, saga.getSagaId(), causationId
        );

        outboxPublisher.enqueueAndPublish(
                "BOOKING",
                booking.getId().toString(),
                "VOID_PAYMENT_COMMAND",
                RabbitMQConstants.EXCHANGE_COMMANDS,
                RabbitMQConstants.ROUTING_KEY_VOID_PAYMENT,
                voidEnvelope
        );
        log.info("Enqueued VoidPaymentCommand via Outbox for booking {}", booking.getBookingCode());
        completeStep(saga, "COMPENSATE_PAYMENT");
    }

    private void compensateHotel(SagaInstance saga, Booking booking, String causationId) {
        recordStep(saga, "COMPENSATE_HOTEL", "COMPENSATION", "PENDING");
        BookingHotelDetail hotelDetail = booking.getHotelDetails().get(0);
        ReleaseHotelCommand releaseCmd = ReleaseHotelCommand.builder()
                .bookingId(booking.getId())
                .bookingCode(booking.getBookingCode())
                .hotelId(hotelDetail.getHotelId())
                .roomTypeId(hotelDetail.getRoomTypeId())
                .checkInDate(hotelDetail.getCheckInDate())
                .checkOutDate(hotelDetail.getCheckOutDate())
                .roomQuantity(hotelDetail.getRoomQuantity())
                .build();

        MessageEnvelope<ReleaseHotelCommand> releaseEnvelope = MessageEnvelope.of(
                "RELEASE_HOTEL_COMMAND", releaseCmd, saga.getSagaId(), causationId
        );

        outboxPublisher.enqueueAndPublish(
                "BOOKING",
                booking.getId().toString(),
                "RELEASE_HOTEL_COMMAND",
                RabbitMQConstants.EXCHANGE_COMMANDS,
                RabbitMQConstants.ROUTING_KEY_RELEASE_HOTEL,
                releaseEnvelope
        );
        log.info("Enqueued ReleaseHotelCommand via Outbox for booking {}", booking.getBookingCode());
        completeStep(saga, "COMPENSATE_HOTEL");
    }

    @Override
    @Transactional(readOnly = true)
    public SagaInstance getSagaByBookingId(Long bookingId) {
        return sagaInstanceRepository.findTopByBookingIdOrderByIdDesc(bookingId)
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

        outboxPublisher.enqueueAndPublish(
                "BOOKING",
                booking.getId().toString(),
                "AUTHORIZE_PAYMENT_COMMAND",
                RabbitMQConstants.EXCHANGE_COMMANDS,
                RabbitMQConstants.ROUTING_KEY_AUTHORIZE_PAYMENT,
                payEnvelope
        );
        log.info("Enqueued AuthorizePaymentCommand via Outbox for booking {}: amount={}",
                booking.getBookingCode(), booking.getTotalAmount());
    }

    private SagaInstance findSaga(String sagaId, Long bookingId) {
        if (sagaId != null && !sagaId.isBlank()) {
            var opt = sagaInstanceRepository.findBySagaId(sagaId);
            if (opt.isPresent()) return opt.get();
        }
        return sagaInstanceRepository.findTopByBookingIdOrderByIdDesc(bookingId)
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

    private void failStep(SagaInstance saga, String stepName, String reason) {
        SagaStep step = sagaStepRepository.findBySagaInstanceSagaIdAndStepName(saga.getSagaId(), stepName)
                .orElseGet(() -> SagaStep.builder()
                        .sagaInstance(saga)
                        .stepName(stepName)
                        .actionType("COMMAND")
                        .build());
        step.setStatus("FAILED");
        step.setLastError(reason);
        step.setCompletedAt(LocalDateTime.now());
        sagaStepRepository.save(step);
    }
}

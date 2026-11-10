package com.smarttrip.booking.service.impl;

import com.smarttrip.booking.client.TourFeignClient;
import com.smarttrip.booking.client.UserFeignClient;
import com.smarttrip.booking.client.dto.DepartureSnapshotDto;
import com.smarttrip.booking.client.dto.UserStatusDto;
import com.smarttrip.booking.dto.*;
import com.smarttrip.booking.entity.*;
import com.smarttrip.booking.exception.BusinessException;
import com.smarttrip.booking.exception.ResourceNotFoundException;
import com.smarttrip.booking.exception.UserBlockedException;
import com.smarttrip.booking.repository.BookingRepository;
import com.smarttrip.booking.repository.SagaInstanceRepository;
import com.smarttrip.booking.repository.SagaStepRepository;
import com.smarttrip.booking.saga.BookingSagaOrchestrator;
import com.smarttrip.booking.service.BookingService;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final SagaInstanceRepository sagaInstanceRepository;
    private final SagaStepRepository sagaStepRepository;
    private final UserFeignClient userFeignClient;
    private final TourFeignClient tourFeignClient;
    private final BookingSagaOrchestrator sagaOrchestrator;

    @Override
    @Transactional
    public BookingResponse createBooking(BookingCreateRequest request) {
        if (request.getCustomerId() == null) {
            throw new BusinessException("Customer ID is required");
        }
        if (request.getQuantity() == null || request.getQuantity() < 1) {
            throw new BusinessException("Quantity must be at least 1");
        }
        if (request.getUnitPrice() == null || request.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Tour unit price must be greater than zero");
        }

        // OpenFeign Scenario 1: Verify Customer status
        validateCustomerStatus(request.getCustomerId());

        // OpenFeign Scenario 2: Verify Departure and Snapshot pricing
        validateAndSnapshotTour(request);

        // Idempotency check
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            var existing = bookingRepository.findByIdempotencyKey(request.getIdempotencyKey());
            if (existing.isPresent()) {
                log.info("Duplicate booking request with idempotency key: {}", request.getIdempotencyKey());
                return mapToResponse(existing.get());
            }
        }

        // Calculate snapshot subtotals
        BigDecimal tourSubtotal = request.getUnitPrice().multiply(BigDecimal.valueOf(request.getQuantity()));
        BigDecimal hotelTotal = BigDecimal.ZERO;

        List<BookingHotelDetail> hotelDetails = new ArrayList<>();
        if (request.getHotelDetails() != null) {
            for (BookingHotelDetailRequest hd : request.getHotelDetails()) {
                BigDecimal detailTotal = hd.getPrice().multiply(BigDecimal.valueOf(hd.getRoomQuantity()));
                hotelTotal = hotelTotal.add(detailTotal);
            }
        }

        BigDecimal totalAmount = tourSubtotal.add(hotelTotal);

        // Generate unique booking code
        String bookingCode = "BK-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .customerId(request.getCustomerId())
                .status("PENDING")
                .totalAmount(totalAmount)
                .currency("VND")
                .idempotencyKey(request.getIdempotencyKey())
                .build();

        // Tour item snapshot
        BookingItem item = BookingItem.builder()
                .booking(booking)
                .tourId(request.getTourId())
                .departureId(request.getDepartureId())
                .tourNameSnapshot(request.getTourName())
                .departureDateSnapshot(request.getDepartureDate())
                .unitPriceSnapshot(request.getUnitPrice())
                .quantity(request.getQuantity())
                .subtotal(tourSubtotal)
                .build();
        booking.getItems().add(item);

        // Passengers
        if (request.getPassengers() != null) {
            for (BookingPassengerRequest p : request.getPassengers()) {
                BookingPassenger passenger = BookingPassenger.builder()
                        .booking(booking)
                        .fullName(p.getFullName())
                        .phone(p.getPhone())
                        .dateOfBirth(p.getDateOfBirth())
                        .build();
                booking.getPassengers().add(passenger);
            }
        }

        // Hotel details snapshot
        if (request.getHotelDetails() != null) {
            for (BookingHotelDetailRequest hd : request.getHotelDetails()) {
                BookingHotelDetail detail = BookingHotelDetail.builder()
                        .booking(booking)
                        .hotelId(hd.getHotelId())
                        .hotelNameSnapshot(hd.getHotelName())
                        .roomTypeId(hd.getRoomTypeId())
                        .roomNameSnapshot(hd.getRoomName())
                        .checkInDate(hd.getCheckInDate())
                        .checkOutDate(hd.getCheckOutDate())
                        .roomQuantity(hd.getRoomQuantity())
                        .priceSnapshot(hd.getPrice())
                        .build();
                booking.getHotelDetails().add(detail);
            }
        }

        Booking savedBooking = bookingRepository.save(booking);

        // Initialize Saga instance for this booking
        SagaInstance saga = SagaInstance.builder()
                .sagaId(UUID.randomUUID().toString())
                .bookingId(savedBooking.getId())
                .sagaType("BOOKING_CREATE")
                .status("STARTED")
                .currentStep("PENDING_CONFIRMATION")
                .build();
        saga = sagaInstanceRepository.save(saga);

        // Trigger Booking Saga Orchestrator
        if (sagaOrchestrator != null) {
            sagaOrchestrator.startSaga(savedBooking, saga);
        }

        log.info("Created booking {} with status PENDING, total amount: {} VND",
                savedBooking.getBookingCode(), savedBooking.getTotalAmount());

        return mapToResponse(savedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingByCode(String bookingCode) {
        return bookingRepository.findByBookingCode(bookingCode)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with code: " + bookingCode));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByCustomerId(Long customerId) {
        if (customerId == null) {
            throw new BusinessException("Customer ID is required");
        }
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(String bookingCode, Long customerId) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with code: " + bookingCode));

        // 1. Verify Customer ownership (if customerId provided via header or param)
        if (customerId != null && !booking.getCustomerId().equals(customerId)) {
            throw new BusinessException("You are not authorized to cancel this booking");
        }

        // 1. Verify booking is in CONFIRMED status
        if (!"CONFIRMED".equalsIgnoreCase(booking.getStatus())) {
            throw new BusinessException("Only CONFIRMED bookings can be cancelled. Current status: " + booking.getStatus());
        }

        // 2-4. Trigger Cancellation Saga
        if (sagaOrchestrator != null) {
            sagaOrchestrator.cancelBooking(booking);
        }

        // 5. Update booking status to CANCELLED
        booking.setStatus("CANCELLED");
        Booking saved = bookingRepository.save(booking);

        log.info("Booking {} successfully cancelled by customer {}", bookingCode, customerId);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SagaStatusResponse getSagaStatusByBookingCode(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with code: " + bookingCode));

        SagaInstance saga = sagaInstanceRepository.findByBookingId(booking.getId())
                .orElse(null);

        if (saga == null) {
            return SagaStatusResponse.builder()
                    .bookingId(booking.getId())
                    .bookingCode(bookingCode)
                    .status(booking.getStatus())
                    .currentStep(booking.getStatus())
                    .build();
        }

        List<SagaStep> steps = sagaStepRepository != null
                ? sagaStepRepository.findBySagaInstanceSagaId(saga.getSagaId())
                : saga.getSteps();

        List<SagaStepResponse> stepResponses = new ArrayList<>();
        if (steps != null) {
            for (SagaStep s : steps) {
                stepResponses.add(SagaStepResponse.builder()
                        .stepName(s.getStepName())
                        .actionType(s.getActionType())
                        .status(s.getStatus())
                        .attemptCount(s.getAttemptCount())
                        .lastError(s.getLastError())
                        .startedAt(s.getStartedAt())
                        .completedAt(s.getCompletedAt())
                        .build());
            }
        }

        return SagaStatusResponse.builder()
                .sagaId(saga.getSagaId())
                .bookingId(booking.getId())
                .bookingCode(bookingCode)
                .sagaType(saga.getSagaType())
                .status(saga.getStatus())
                .currentStep(saga.getCurrentStep())
                .failureReason(saga.getFailureReason())
                .steps(stepResponses)
                .startedAt(saga.getStartedAt())
                .completedAt(saga.getCompletedAt())
                .build();
    }


    @Override
    @Transactional(readOnly = true)
    public List<SagaStatusResponse> getAllSagas() {
        List<SagaInstance> sagas = sagaInstanceRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        List<SagaStatusResponse> responses = new ArrayList<>();
        for (SagaInstance saga : sagas) {
            String bookingCode = "UNKNOWN";
            if (saga.getBookingId() != null) {
                bookingCode = bookingRepository.findById(saga.getBookingId())
                        .map(Booking::getBookingCode)
                        .orElse("BK-" + saga.getBookingId());
            }

            List<SagaStep> steps = sagaStepRepository != null
                    ? sagaStepRepository.findBySagaInstanceSagaId(saga.getSagaId())
                    : saga.getSteps();

            List<SagaStepResponse> stepResponses = new ArrayList<>();
            if (steps != null) {
                for (SagaStep s : steps) {
                    stepResponses.add(SagaStepResponse.builder()
                            .stepName(s.getStepName())
                            .actionType(s.getActionType())
                            .status(s.getStatus())
                            .attemptCount(s.getAttemptCount())
                            .lastError(s.getLastError())
                            .startedAt(s.getStartedAt())
                            .completedAt(s.getCompletedAt())
                            .build());
                }
            }

            responses.add(SagaStatusResponse.builder()
                    .sagaId(saga.getSagaId())
                    .bookingId(saga.getBookingId())
                    .bookingCode(bookingCode)
                    .sagaType(saga.getSagaType())
                    .status(saga.getStatus())
                    .currentStep(saga.getCurrentStep())
                    .failureReason(saga.getFailureReason())
                    .steps(stepResponses)
                    .startedAt(saga.getStartedAt())
                    .completedAt(saga.getCompletedAt())
                    .build());
        }
        return responses;
    }

    private void validateCustomerStatus(Long customerId) {
        if (userFeignClient == null || customerId == null) {
            return;
        }
        try {
            UserStatusDto status = userFeignClient.getUserStatus(customerId);
            if (status != null && status.isBlocked()) {
                log.warn("Blocked user {} attempted to create booking", customerId);
                throw new UserBlockedException(customerId, status.getStatus());
            }
        } catch (UserBlockedException e) {
            throw e;
        } catch (FeignException.NotFound e) {
            log.warn("User {} not found via OpenFeign, rejecting booking", customerId);
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        } catch (FeignException e) {
            log.error("OpenFeign user-service call failed: status={}, message={}", e.status(), e.getMessage());
            throw new BusinessException("Unable to verify user account status, please retry later");
        }
    }

    private void validateAndSnapshotTour(BookingCreateRequest request) {
        if (tourFeignClient == null || request.getDepartureId() == null) {
            return;
        }
        try {
            DepartureSnapshotDto snapshot = tourFeignClient.getDepartureSnapshot(request.getDepartureId());
            if (snapshot == null) {
                throw new ResourceNotFoundException("Tour departure not found: " + request.getDepartureId());
            }
            if (request.getQuantity() != null && snapshot.getAvailableSeats() != null
                    && snapshot.getAvailableSeats() < request.getQuantity()) {
                log.warn("Not enough available seats for departure {}: requested={}, available={}",
                        request.getDepartureId(), request.getQuantity(), snapshot.getAvailableSeats());
                throw new BusinessException(String.format(
                        "Not enough available seats: requested %d, available %d",
                        request.getQuantity(), snapshot.getAvailableSeats()));
            }

            if (snapshot.getTourId() != null) {
                request.setTourId(snapshot.getTourId());
            }
            if (snapshot.getTourName() != null && !snapshot.getTourName().isBlank()) {
                request.setTourName(snapshot.getTourName());
            }
            if (snapshot.getDepartureDate() != null) {
                request.setDepartureDate(snapshot.getDepartureDate());
            }
            if (snapshot.getPrice() != null) {
                request.setUnitPrice(snapshot.getPrice());
            }
            log.info("Validated departure {} via OpenFeign, using authoritative snapshot price={}",
                    request.getDepartureId(), snapshot.getPrice());
        } catch (BusinessException | ResourceNotFoundException e) {
            throw e;
        } catch (FeignException.NotFound e) {
            log.warn("Tour departure {} not found via OpenFeign", request.getDepartureId());
            throw new ResourceNotFoundException("Tour departure not found with id: " + request.getDepartureId());
        } catch (FeignException e) {
            log.error("OpenFeign tour-service call failed: status={}, message={}", e.status(), e.getMessage());
            throw new BusinessException("Unable to verify tour departure, please retry later");
        }
    }

    private BookingResponse mapToResponse(Booking booking) {
        List<BookingItemResponse> itemResponses = booking.getItems() != null ?
                booking.getItems().stream().map(this::mapItemToResponse).collect(Collectors.toList())
                : new ArrayList<>();

        List<BookingPassengerResponse> passengerResponses = booking.getPassengers() != null ?
                booking.getPassengers().stream().map(this::mapPassengerToResponse).collect(Collectors.toList())
                : new ArrayList<>();

        List<BookingHotelDetailResponse> hotelResponses = booking.getHotelDetails() != null ?
                booking.getHotelDetails().stream().map(this::mapHotelDetailToResponse).collect(Collectors.toList())
                : new ArrayList<>();

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .customerId(booking.getCustomerId())
                .status(booking.getStatus())
                .totalAmount(booking.getTotalAmount())
                .currency(booking.getCurrency())
                .idempotencyKey(booking.getIdempotencyKey())
                .items(itemResponses)
                .passengers(passengerResponses)
                .hotelDetails(hotelResponses)
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }

    private BookingItemResponse mapItemToResponse(BookingItem item) {
        return BookingItemResponse.builder()
                .id(item.getId())
                .tourId(item.getTourId())
                .departureId(item.getDepartureId())
                .tourNameSnapshot(item.getTourNameSnapshot())
                .departureDateSnapshot(item.getDepartureDateSnapshot())
                .unitPriceSnapshot(item.getUnitPriceSnapshot())
                .quantity(item.getQuantity())
                .subtotal(item.getSubtotal())
                .build();
    }

    private BookingPassengerResponse mapPassengerToResponse(BookingPassenger p) {
        return BookingPassengerResponse.builder()
                .id(p.getId())
                .fullName(p.getFullName())
                .phone(p.getPhone())
                .dateOfBirth(p.getDateOfBirth())
                .build();
    }

    private BookingHotelDetailResponse mapHotelDetailToResponse(BookingHotelDetail h) {
        return BookingHotelDetailResponse.builder()
                .id(h.getId())
                .hotelId(h.getHotelId())
                .hotelNameSnapshot(h.getHotelNameSnapshot())
                .roomTypeId(h.getRoomTypeId())
                .roomNameSnapshot(h.getRoomNameSnapshot())
                .checkInDate(h.getCheckInDate())
                .checkOutDate(h.getCheckOutDate())
                .roomQuantity(h.getRoomQuantity())
                .priceSnapshot(h.getPriceSnapshot())
                .build();
    }
}

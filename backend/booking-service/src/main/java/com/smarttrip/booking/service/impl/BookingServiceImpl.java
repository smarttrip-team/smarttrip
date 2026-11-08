package com.smarttrip.booking.service.impl;

import com.smarttrip.booking.dto.*;
import com.smarttrip.booking.entity.*;
import com.smarttrip.booking.exception.BusinessException;
import com.smarttrip.booking.exception.ResourceNotFoundException;
import com.smarttrip.booking.repository.BookingRepository;
import com.smarttrip.booking.repository.SagaInstanceRepository;
import com.smarttrip.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final SagaInstanceRepository sagaInstanceRepository;

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
        sagaInstanceRepository.save(saga);

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

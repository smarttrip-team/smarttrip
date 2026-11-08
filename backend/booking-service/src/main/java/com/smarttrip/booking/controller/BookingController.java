package com.smarttrip.booking.controller;

import com.smarttrip.booking.dto.BookingCreateRequest;
import com.smarttrip.booking.dto.BookingResponse;
import com.smarttrip.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/api/bookings/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "service", "booking-service",
                "status", "UP"
        ));
    }

    @PostMapping("/api/v1/bookings")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingCreateRequest request,
            @RequestHeader(name = "X-User-Id", required = false) Long headerUserId) {
        if (request.getCustomerId() == null && headerUserId != null) {
            request.setCustomerId(headerUserId);
        }
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @GetMapping({"/api/v1/bookings/{bookingCode}", "/api/bookings/code/{bookingCode}"})
    public ResponseEntity<BookingResponse> getBookingByCode(@PathVariable String bookingCode) {
        return ResponseEntity.ok(bookingService.getBookingByCode(bookingCode));
    }

    @GetMapping("/api/v1/bookings")
    public ResponseEntity<List<BookingResponse>> getBookings(
            @RequestParam(name = "customerId", required = false) Long customerId,
            @RequestHeader(name = "X-User-Id", required = false) Long headerUserId) {
        Long targetCustomerId = (customerId != null) ? customerId : headerUserId;
        if (targetCustomerId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(bookingService.getBookingsByCustomerId(targetCustomerId));
    }

    @GetMapping("/api/bookings/customer/{customerId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByCustomerId(@PathVariable Long customerId) {
        return ResponseEntity.ok(bookingService.getBookingsByCustomerId(customerId));
    }

    @PostMapping({"/api/v1/bookings/{bookingCode}/cancel", "/api/bookings/{bookingCode}/cancel"})
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable String bookingCode,
            @RequestHeader(name = "X-User-Id", required = false) Long headerUserId) {
        BookingResponse response = bookingService.cancelBooking(bookingCode, headerUserId);
        return ResponseEntity.ok(response);
    }
}

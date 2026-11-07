package com.smarttrip.booking.service.impl;

import com.smarttrip.booking.dto.BookingResponse;
import com.smarttrip.booking.entity.Booking;
import com.smarttrip.booking.repository.BookingRepository;
import com.smarttrip.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByCustomerId(Long customerId) {
        return bookingRepository.findByCustomerId(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingByCode(String bookingCode) {
        return bookingRepository.findByBookingCode(bookingCode)
                .map(this::mapToResponse)
                .orElse(null);
    }

    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .customerId(booking.getCustomerId())
                .status(booking.getStatus())
                .totalAmount(booking.getTotalAmount())
                .currency(booking.getCurrency())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}

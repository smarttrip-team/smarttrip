package com.smarttrip.booking.service;

import com.smarttrip.booking.dto.BookingCreateRequest;
import com.smarttrip.booking.dto.BookingResponse;

import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingCreateRequest request);
    BookingResponse getBookingByCode(String bookingCode);
    List<BookingResponse> getBookingsByCustomerId(Long customerId);
    BookingResponse cancelBooking(String bookingCode, Long customerId);
}

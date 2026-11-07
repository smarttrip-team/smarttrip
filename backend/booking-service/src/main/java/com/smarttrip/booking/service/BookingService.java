package com.smarttrip.booking.service;

import com.smarttrip.booking.dto.BookingResponse;
import java.util.List;

public interface BookingService {
    List<BookingResponse> getBookingsByCustomerId(Long customerId);
    BookingResponse getBookingByCode(String bookingCode);
}

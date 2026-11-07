package com.smarttrip.booking.repository;

import com.smarttrip.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingCode(String bookingCode);
    List<Booking> findByCustomerId(Long customerId);
    Optional<Booking> findByIdempotencyKey(String idempotencyKey);
}

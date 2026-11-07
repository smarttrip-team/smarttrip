package com.smarttrip.hotel.repository;

import com.smarttrip.hotel.entity.HotelReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HotelReservationRepository extends JpaRepository<HotelReservation, Long> {
    Optional<HotelReservation> findByBookingId(String bookingId);
}

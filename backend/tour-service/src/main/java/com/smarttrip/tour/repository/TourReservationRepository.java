package com.smarttrip.tour.repository;

import com.smarttrip.tour.entity.TourReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TourReservationRepository extends JpaRepository<TourReservation, Long> {
    Optional<TourReservation> findByBookingId(String bookingId);
}

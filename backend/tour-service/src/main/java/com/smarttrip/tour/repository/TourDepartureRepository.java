package com.smarttrip.tour.repository;

import com.smarttrip.tour.entity.TourDeparture;
import com.smarttrip.tour.enums.DepartureStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TourDepartureRepository extends JpaRepository<TourDeparture, Long> {
    List<TourDeparture> findByTourIdAndDepartureDateAfterAndStatusOrderByDepartureDateAsc(
            Long tourId, LocalDate date, DepartureStatus status);
}

package com.smarttrip.tour.repository;

import com.smarttrip.tour.entity.TourDeparture;
import com.smarttrip.tour.enums.DepartureStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TourDepartureRepository extends JpaRepository<TourDeparture, Long> {
    List<TourDeparture> findByTourIdAndDepartureDateAfterAndStatusOrderByDepartureDateAsc(
            Long tourId, LocalDate date, DepartureStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM TourDeparture d WHERE d.id = :id")
    Optional<TourDeparture> findByIdForUpdate(@Param("id") Long id);
}

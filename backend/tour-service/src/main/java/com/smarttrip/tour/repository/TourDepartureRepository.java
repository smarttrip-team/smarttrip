package com.smarttrip.tour.repository;

import com.smarttrip.tour.entity.TourDeparture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourDepartureRepository extends JpaRepository<TourDeparture, Long> {
    List<TourDeparture> findByTourId(Long tourId);
}

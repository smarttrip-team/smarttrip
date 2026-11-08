package com.smarttrip.tour.repository;

import com.smarttrip.tour.entity.Tour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourRepository extends JpaRepository<Tour, Long> {
    List<Tour> findByStatus(String status);
    List<Tour> findByOperatorId(Long operatorId);
}

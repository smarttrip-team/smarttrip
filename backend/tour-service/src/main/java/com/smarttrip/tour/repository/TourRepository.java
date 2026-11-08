package com.smarttrip.tour.repository;

import com.smarttrip.tour.entity.Tour;
import com.smarttrip.tour.enums.TourStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface TourRepository extends JpaRepository<Tour, Long>, JpaSpecificationExecutor<Tour> {

    @Query("SELECT t FROM Tour t WHERE t.status = :status " +
           "AND (:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:destinationId IS NULL OR t.destination.id = :destinationId) " +
           "AND (:minPrice IS NULL OR t.basePrice >= :minPrice) " +
           "AND (:maxPrice IS NULL OR t.basePrice <= :maxPrice)")
    Page<Tour> searchTours(
            @Param("status") TourStatus status,
            @Param("keyword") String keyword,
            @Param("destinationId") Long destinationId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );
}

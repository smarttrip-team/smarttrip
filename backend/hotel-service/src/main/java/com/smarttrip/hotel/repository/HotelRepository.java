package com.smarttrip.hotel.repository;

import com.smarttrip.hotel.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    List<Hotel> findByStatus(String status);
    List<Hotel> findByManagerId(Long managerId);

    @Query("SELECT h FROM Hotel h WHERE (:location IS NULL OR LOWER(h.address) LIKE LOWER(CONCAT('%', :location, '%')) OR LOWER(h.name) LIKE LOWER(CONCAT('%', :location, '%'))) AND h.status = 'ACTIVE'")
    List<Hotel> searchHotels(@Param("location") String location);
}

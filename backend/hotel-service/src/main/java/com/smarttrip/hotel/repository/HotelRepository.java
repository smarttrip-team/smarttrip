package com.smarttrip.hotel.repository;

import com.smarttrip.hotel.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    List<Hotel> findByStatus(String status);
    List<Hotel> findByManagerId(Long managerId);
}

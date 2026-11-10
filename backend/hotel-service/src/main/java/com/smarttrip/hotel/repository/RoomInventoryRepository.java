package com.smarttrip.hotel.repository;

import com.smarttrip.hotel.entity.RoomInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomInventoryRepository extends JpaRepository<RoomInventory, Long> {
    Optional<RoomInventory> findByRoomTypeIdAndInventoryDate(Long roomTypeId, LocalDate inventoryDate);
    List<RoomInventory> findByRoomTypeIdAndInventoryDateBetween(Long roomTypeId, LocalDate startDate, LocalDate endDate);
    List<RoomInventory> findByRoomTypeIdInAndInventoryDateBetween(Collection<Long> roomTypeIds, LocalDate startDate, LocalDate endDate);
}

package com.smarttrip.hotel.service;

import com.smarttrip.hotel.dto.*;

import java.time.LocalDate;
import java.util.List;

public interface HotelService {
    List<HotelResponse> getAllHotels(String location);
    HotelResponse getHotelById(Long id);
    HotelAvailabilityResponse checkAvailability(Long hotelId, LocalDate checkIn, LocalDate checkOut, Long roomTypeId);
    HotelResponse createHotel(HotelCreateRequest request);
    HotelResponse updateHotel(Long id, HotelUpdateRequest request);
    RoomTypeResponse addRoomType(Long hotelId, RoomTypeCreateRequest request);
    void updateInventoryBatch(InventoryBatchUpdateRequest request);
}

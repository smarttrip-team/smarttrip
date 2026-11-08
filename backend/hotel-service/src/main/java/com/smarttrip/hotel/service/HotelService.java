package com.smarttrip.hotel.service;

import com.smarttrip.hotel.dto.HotelResponse;
import java.util.List;

public interface HotelService {
    List<HotelResponse> getAllHotels();
    HotelResponse getHotelById(Long id);
}

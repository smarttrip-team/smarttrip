package com.smarttrip.hotel.service.impl;

import com.smarttrip.hotel.dto.HotelResponse;
import com.smarttrip.hotel.dto.RoomTypeResponse;
import com.smarttrip.hotel.entity.Hotel;
import com.smarttrip.hotel.repository.HotelRepository;
import com.smarttrip.hotel.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HotelResponse> getAllHotels() {
        return hotelRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HotelResponse getHotelById(Long id) {
        return hotelRepository.findById(id)
                .map(this::mapToResponse)
                .orElse(null);
    }

    private HotelResponse mapToResponse(Hotel hotel) {
        List<RoomTypeResponse> roomTypes = hotel.getRoomTypes() != null
                ? hotel.getRoomTypes().stream()
                .map(r -> RoomTypeResponse.builder()
                        .id(r.getId())
                        .hotelId(hotel.getId())
                        .name(r.getName())
                        .capacity(r.getCapacity())
                        .basePrice(r.getBasePrice())
                        .status(r.getStatus())
                        .build())
                .collect(Collectors.toList())
                : List.of();

        return HotelResponse.builder()
                .id(hotel.getId())
                .managerId(hotel.getManagerId())
                .name(hotel.getName())
                .address(hotel.getAddress())
                .description(hotel.getDescription())
                .status(hotel.getStatus())
                .roomTypes(roomTypes)
                .build();
    }
}

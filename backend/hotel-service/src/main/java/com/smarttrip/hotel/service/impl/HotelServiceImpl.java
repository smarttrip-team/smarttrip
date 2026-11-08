package com.smarttrip.hotel.service.impl;

import com.smarttrip.hotel.dto.*;
import com.smarttrip.hotel.entity.Hotel;
import com.smarttrip.hotel.entity.RoomInventory;
import com.smarttrip.hotel.entity.RoomType;
import com.smarttrip.hotel.exception.BusinessException;
import com.smarttrip.hotel.exception.ResourceNotFoundException;
import com.smarttrip.hotel.repository.HotelRepository;
import com.smarttrip.hotel.repository.RoomInventoryRepository;
import com.smarttrip.hotel.repository.RoomTypeRepository;
import com.smarttrip.hotel.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomInventoryRepository roomInventoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HotelResponse> getAllHotels(String location) {
        List<Hotel> hotels = (location != null && !location.isBlank())
                ? hotelRepository.searchHotels(location.trim())
                : hotelRepository.findAll();

        return hotels.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HotelResponse getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
        return mapToResponse(hotel);
    }

    @Override
    @Transactional(readOnly = true)
    public HotelAvailabilityResponse checkAvailability(Long hotelId, LocalDate checkIn, LocalDate checkOut, Long roomTypeId) {
        if (checkIn == null || checkOut == null) {
            throw new BusinessException("checkIn and checkOut dates are required");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new BusinessException("checkOut date must be after checkIn date");
        }

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + hotelId));

        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
        LocalDate lastNight = checkOut.minusDays(1);

        List<RoomType> targetRoomTypes = hotel.getRoomTypes().stream()
                .filter(rt -> "ACTIVE".equalsIgnoreCase(rt.getStatus()))
                .filter(rt -> roomTypeId == null || rt.getId().equals(roomTypeId))
                .collect(Collectors.toList());

        if (roomTypeId != null && targetRoomTypes.isEmpty()) {
            throw new ResourceNotFoundException("Room type not found or inactive for id: " + roomTypeId);
        }

        List<RoomTypeAvailabilityResponse> roomAvailabilities = new ArrayList<>();

        for (RoomType rt : targetRoomTypes) {
            List<RoomInventory> inventories = roomInventoryRepository
                    .findByRoomTypeIdAndInventoryDateBetween(rt.getId(), checkIn, lastNight);

            Map<LocalDate, RoomInventory> inventoryMap = inventories.stream()
                    .collect(Collectors.toMap(RoomInventory::getInventoryDate, Function.identity(), (a, b) -> a));

            int minAvailable = Integer.MAX_VALUE;
            boolean hasAllDates = true;

            for (LocalDate date = checkIn; !date.isAfter(lastNight); date = date.plusDays(1)) {
                RoomInventory inv = inventoryMap.get(date);
                if (inv == null || inv.getAvailableRooms() == null || inv.getAvailableRooms() <= 0) {
                    minAvailable = 0;
                    hasAllDates = false;
                    break;
                } else {
                    if (inv.getAvailableRooms() < minAvailable) {
                        minAvailable = inv.getAvailableRooms();
                    }
                }
            }

            if (!hasAllDates && minAvailable == Integer.MAX_VALUE) {
                minAvailable = 0;
            }

            roomAvailabilities.add(RoomTypeAvailabilityResponse.builder()
                    .roomTypeId(rt.getId())
                    .roomTypeName(rt.getName())
                    .capacity(rt.getCapacity())
                    .basePrice(rt.getBasePrice())
                    .minAvailableRooms(minAvailable)
                    .available(minAvailable > 0)
                    .build());
        }

        return HotelAvailabilityResponse.builder()
                .hotelId(hotel.getId())
                .hotelName(hotel.getName())
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .numberOfNights(nights)
                .roomAvailabilities(roomAvailabilities)
                .build();
    }

    @Override
    @Transactional
    public HotelResponse createHotel(HotelCreateRequest request) {
        Hotel hotel = Hotel.builder()
                .name(request.getName().trim())
                .address(request.getAddress().trim())
                .description(request.getDescription())
                .managerId(request.getManagerId())
                .status("ACTIVE")
                .build();

        Hotel saved = hotelRepository.save(hotel);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public HotelResponse updateHotel(Long id, HotelUpdateRequest request) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));

        if (request.getName() != null && !request.getName().isBlank()) {
            hotel.setName(request.getName().trim());
        }
        if (request.getAddress() != null && !request.getAddress().isBlank()) {
            hotel.setAddress(request.getAddress().trim());
        }
        if (request.getDescription() != null) {
            hotel.setDescription(request.getDescription());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            hotel.setStatus(request.getStatus().trim());
        }

        Hotel saved = hotelRepository.save(hotel);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public RoomTypeResponse addRoomType(Long hotelId, RoomTypeCreateRequest request) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + hotelId));

        RoomType roomType = RoomType.builder()
                .hotel(hotel)
                .name(request.getName().trim())
                .capacity(request.getCapacity())
                .basePrice(request.getBasePrice())
                .status("ACTIVE")
                .build();

        RoomType saved = roomTypeRepository.save(roomType);
        return mapRoomTypeToResponse(saved);
    }

    @Override
    @Transactional
    public void updateInventoryBatch(InventoryBatchUpdateRequest request) {
        if (!request.getEndDate().isAfter(request.getStartDate()) && !request.getEndDate().isEqual(request.getStartDate())) {
            throw new BusinessException("endDate must be on or after startDate");
        }

        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found with id: " + request.getRoomTypeId()));

        for (LocalDate date = request.getStartDate(); !date.isAfter(request.getEndDate()); date = date.plusDays(1)) {
            RoomInventory inventory = roomInventoryRepository.findByRoomTypeIdAndInventoryDate(roomType.getId(), date)
                    .orElse(RoomInventory.builder()
                            .roomType(roomType)
                            .inventoryDate(date)
                            .totalRooms(request.getTotalRooms())
                            .availableRooms(request.getTotalRooms())
                            .build());

            inventory.setTotalRooms(request.getTotalRooms());
            if (inventory.getAvailableRooms() > request.getTotalRooms()) {
                inventory.setAvailableRooms(request.getTotalRooms());
            }
            roomInventoryRepository.save(inventory);
        }
    }

    private HotelResponse mapToResponse(Hotel hotel) {
        List<RoomTypeResponse> roomTypes = hotel.getRoomTypes() != null
                ? hotel.getRoomTypes().stream()
                .map(this::mapRoomTypeToResponse)
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

    private RoomTypeResponse mapRoomTypeToResponse(RoomType r) {
        return RoomTypeResponse.builder()
                .id(r.getId())
                .hotelId(r.getHotel() != null ? r.getHotel().getId() : null)
                .name(r.getName())
                .capacity(r.getCapacity())
                .basePrice(r.getBasePrice())
                .status(r.getStatus())
                .build();
    }
}

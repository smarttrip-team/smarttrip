package com.smarttrip.hotel.controller;

import com.smarttrip.hotel.dto.*;
import com.smarttrip.hotel.service.HotelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    @GetMapping({"/api/v1/hotels/health", "/api/hotels/health"})
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "service", "hotel-service",
                "status", "UP"
        ));
    }

    @GetMapping({"/api/v1/hotels", "/api/hotels"})
    public ResponseEntity<List<HotelResponse>> getAllHotels(
            @RequestParam(required = false) String location) {
        return ResponseEntity.ok(hotelService.getAllHotels(location));
    }

    @GetMapping({"/api/v1/hotels/{id}", "/api/hotels/{id}"})
    public ResponseEntity<HotelResponse> getHotelById(@PathVariable Long id) {
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }

    @GetMapping({"/api/v1/hotels/{id}/availability", "/api/hotels/{id}/availability"})
    public ResponseEntity<HotelAvailabilityResponse> checkAvailability(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(required = false) Long roomTypeId) {
        return ResponseEntity.ok(hotelService.checkAvailability(id, checkIn, checkOut, roomTypeId));
    }

    @PostMapping({"/api/v1/manager/hotels", "/api/manager/hotels"})
    public ResponseEntity<HotelResponse> createHotel(@Valid @RequestBody HotelCreateRequest request) {
        HotelResponse response = hotelService.createHotel(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping({"/api/v1/manager/hotels/{id}", "/api/manager/hotels/{id}"})
    public ResponseEntity<HotelResponse> updateHotel(
            @PathVariable Long id,
            @Valid @RequestBody HotelUpdateRequest request) {
        return ResponseEntity.ok(hotelService.updateHotel(id, request));
    }

    @PostMapping({"/api/v1/manager/hotels/{id}/room-types", "/api/manager/hotels/{id}/room-types"})
    public ResponseEntity<RoomTypeResponse> addRoomType(
            @PathVariable Long id,
            @Valid @RequestBody RoomTypeCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hotelService.addRoomType(id, request));
    }

    @PostMapping({"/api/v1/manager/room-types/{roomTypeId}/inventory", "/api/manager/room-types/{roomTypeId}/inventory"})
    public ResponseEntity<Map<String, String>> updateInventory(
            @PathVariable Long roomTypeId,
            @Valid @RequestBody InventoryBatchUpdateRequest request) {
        request.setRoomTypeId(roomTypeId);
        hotelService.updateInventoryBatch(request);
        return ResponseEntity.ok(Map.of("message", "Inventory updated successfully"));
    }
}

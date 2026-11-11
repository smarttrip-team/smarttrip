package com.smarttrip.tour.controller;

import com.smarttrip.tour.dto.CreateDepartureRequest;
import com.smarttrip.tour.dto.CreateTourRequest;
import com.smarttrip.tour.dto.DepartureResponse;
import com.smarttrip.tour.dto.TourResponse;
import com.smarttrip.tour.service.TourService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/operator/tours")
@RequiredArgsConstructor
@Tag(name = "Tour Operator", description = "Tour Management for Tour Operators")
public class TourOperatorController {

    private final TourService tourService;

    @PostMapping
    @Operation(summary = "Create a new tour")
    public ResponseEntity<TourResponse> createTour(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long operatorId,
            @Valid @RequestBody CreateTourRequest request) {
        TourResponse response = tourService.createTour(request, operatorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing tour (title, price, image, description)")
    public ResponseEntity<TourResponse> updateTour(
            @PathVariable("id") Long tourId,
            @RequestBody CreateTourRequest request) {
        TourResponse response = tourService.updateTour(tourId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/departures")
    @Operation(summary = "Add a departure schedule to a tour")
    public ResponseEntity<DepartureResponse> addDeparture(
            @PathVariable("id") Long tourId,
            @Valid @RequestBody CreateDepartureRequest request) {
        DepartureResponse response = tourService.addDeparture(tourId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/departures/{departureId}/capacity")
    @Operation(summary = "Update departure capacity")
    public ResponseEntity<DepartureResponse> updateDepartureCapacity(
            @PathVariable("departureId") Long departureId,
            @RequestParam(name = "totalSeats", required = false) Integer totalSeats,
            @RequestParam(name = "availableSeats", required = false) Integer availableSeats) {
        DepartureResponse response = tourService.updateDepartureCapacity(departureId, totalSeats, availableSeats);
        return ResponseEntity.ok(response);
    }
}

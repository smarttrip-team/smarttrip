package com.smarttrip.tour.controller;

import com.smarttrip.tour.dto.TourResponse;
import com.smarttrip.tour.service.TourService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/tours")
@RequiredArgsConstructor
@Tag(name = "Tours", description = "Tour Browsing & Search APIs")
public class TourController {

    private final TourService tourService;

    @GetMapping
    @Operation(summary = "Search and filter tours with pagination")
    public ResponseEntity<Page<TourResponse>> searchTours(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "destinationId", required = false) Long destinationId,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Page<TourResponse> tours = tourService.searchTours(keyword, destinationId, minPrice, maxPrice, page, size);
        return ResponseEntity.ok(tours);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tour details and upcoming departures")
    public ResponseEntity<TourResponse> getTourById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(tourService.getTourById(id));
    }
}

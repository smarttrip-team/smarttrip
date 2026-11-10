package com.smarttrip.tour.controller;

import com.smarttrip.tour.dto.DepartureSnapshotResponse;
import com.smarttrip.tour.service.TourService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/v1/departures")
@RequiredArgsConstructor
@Tag(name = "Internal Tour API", description = "Inter-service OpenFeign APIs")
public class InternalTourController {

    private final TourService tourService;

    @GetMapping("/{id}")
    @Operation(summary = "Internal: Get departure snapshot and pricing")
    public ResponseEntity<DepartureSnapshotResponse> getDepartureSnapshot(@PathVariable("id") Long id) {
        return ResponseEntity.ok(tourService.getDepartureSnapshot(id));
    }
}

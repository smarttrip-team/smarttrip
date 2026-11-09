package com.smarttrip.tour.service;

import com.smarttrip.tour.dto.*;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;

public interface TourService {
    Page<TourResponse> searchTours(String keyword, Long destinationId, BigDecimal minPrice, BigDecimal maxPrice, int page, int size);
    TourResponse getTourById(Long id);
    TourResponse createTour(CreateTourRequest request, Long operatorId);
    DepartureResponse addDeparture(Long tourId, CreateDepartureRequest request);
    DepartureSnapshotResponse getDepartureSnapshot(Long departureId);
    DepartureResponse updateDepartureCapacity(Long departureId, Integer totalSeats, Integer availableSeats);
}

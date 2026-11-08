package com.smarttrip.tour.service.impl;

import com.smarttrip.tour.dto.DepartureResponse;
import com.smarttrip.tour.dto.TourResponse;
import com.smarttrip.tour.entity.Tour;
import com.smarttrip.tour.repository.TourRepository;
import com.smarttrip.tour.service.TourService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TourServiceImpl implements TourService {

    private final TourRepository tourRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TourResponse> getAllTours() {
        return tourRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TourResponse getTourById(Long id) {
        return tourRepository.findById(id)
                .map(this::mapToResponse)
                .orElse(null);
    }

    private TourResponse mapToResponse(Tour tour) {
        List<DepartureResponse> departures = tour.getDepartures() != null
                ? tour.getDepartures().stream()
                .map(d -> DepartureResponse.builder()
                        .id(d.getId())
                        .tourId(tour.getId())
                        .departureDate(d.getDepartureDate())
                        .returnDate(d.getReturnDate())
                        .totalSeats(d.getTotalSeats())
                        .availableSeats(d.getAvailableSeats())
                        .status(d.getStatus())
                        .build())
                .collect(Collectors.toList())
                : List.of();

        return TourResponse.builder()
                .id(tour.getId())
                .operatorId(tour.getOperatorId())
                .name(tour.getName())
                .description(tour.getDescription())
                .destination(tour.getDestination())
                .durationDays(tour.getDurationDays())
                .basePrice(tour.getBasePrice())
                .status(tour.getStatus())
                .departures(departures)
                .build();
    }
}

package com.smarttrip.tour.service.impl;

import com.smarttrip.tour.dto.*;
import com.smarttrip.tour.entity.Destination;
import com.smarttrip.tour.entity.Tour;
import com.smarttrip.tour.entity.TourDeparture;
import com.smarttrip.tour.enums.DepartureStatus;
import com.smarttrip.tour.enums.TourStatus;
import com.smarttrip.tour.exception.BusinessException;
import com.smarttrip.tour.exception.ResourceNotFoundException;
import com.smarttrip.tour.repository.DestinationRepository;
import com.smarttrip.tour.repository.TourDepartureRepository;
import com.smarttrip.tour.repository.TourRepository;
import com.smarttrip.tour.service.TourService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TourServiceImpl implements TourService {

    private final TourRepository tourRepository;
    private final DestinationRepository destinationRepository;
    private final TourDepartureRepository departureRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<TourResponse> searchTours(String keyword, Long destinationId, BigDecimal minPrice, BigDecimal maxPrice, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Tour> tours = tourRepository.searchTours(TourStatus.PUBLISHED, keyword, destinationId, minPrice, maxPrice, pageable);
        return tours.map(this::toTourResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public TourResponse getTourById(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found with id: " + id));
        return toTourResponse(tour);
    }

    @Override
    @Transactional
    public TourResponse createTour(CreateTourRequest request, Long operatorId) {
        Destination destination = destinationRepository.findById(request.getDestinationId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with id: " + request.getDestinationId()));

        Tour tour = Tour.builder()
                .destination(destination)
                .title(request.getTitle())
                .description(request.getDescription())
                .durationDays(request.getDurationDays())
                .basePrice(request.getBasePrice())
                .status(TourStatus.PUBLISHED)
                .createdBy(operatorId)
                .build();

        Tour saved = tourRepository.save(tour);
        return toTourResponse(saved);
    }

    @Override
    @Transactional
    public DepartureResponse addDeparture(Long tourId, CreateDepartureRequest request) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found with id: " + tourId));

        if (request.getDepartureDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Departure date cannot be in the past");
        }

        if (request.getReturnDate().isBefore(request.getDepartureDate())) {
            throw new BusinessException("Return date cannot be before departure date");
        }

        if (request.getTotalSeats() <= 0) {
            throw new BusinessException("Total seats must be greater than 0");
        }

        TourDeparture departure = TourDeparture.builder()
                .tour(tour)
                .departureDate(request.getDepartureDate())
                .returnDate(request.getReturnDate())
                .price(request.getPrice())
                .totalSeats(request.getTotalSeats())
                .availableSeats(request.getTotalSeats())
                .status(DepartureStatus.SCHEDULED)
                .build();

        TourDeparture saved = departureRepository.save(departure);
        return toDepartureResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DepartureSnapshotResponse getDepartureSnapshot(Long departureId) {
        TourDeparture departure = departureRepository.findById(departureId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour departure not found with id: " + departureId));

        boolean isActive = departure.getStatus() == DepartureStatus.SCHEDULED 
                && departure.getAvailableSeats() > 0 
                && !departure.getDepartureDate().isBefore(LocalDate.now());

        return DepartureSnapshotResponse.builder()
                .departureId(departure.getId())
                .tourId(departure.getTour().getId())
                .tourTitle(departure.getTour().getTitle())
                .destinationName(departure.getTour().getDestination().getName())
                .departureDate(departure.getDepartureDate())
                .returnDate(departure.getReturnDate())
                .price(departure.getPrice())
                .totalSeats(departure.getTotalSeats())
                .availableSeats(departure.getAvailableSeats())
                .status(departure.getStatus().name())
                .active(isActive)
                .build();
    }


    @Override
    @Transactional
    public DepartureResponse updateDepartureCapacity(Long departureId, Integer totalSeats, Integer availableSeats) {
        TourDeparture departure = departureRepository.findById(departureId)
                .orElseThrow(() -> new ResourceNotFoundException("Departure not found with id: " + departureId));

        if (totalSeats != null) {
            departure.setTotalSeats(totalSeats);
        }
        if (availableSeats != null) {
            departure.setAvailableSeats(availableSeats);
        }

        TourDeparture saved = departureRepository.save(departure);
        return toDepartureResponse(saved);
    }

    private TourResponse toTourResponse(Tour tour) {
        List<TourDeparture> upcoming = departureRepository.findByTourIdAndDepartureDateAfterAndStatusOrderByDepartureDateAsc(
                tour.getId(), LocalDate.now().minusDays(1), DepartureStatus.SCHEDULED);

        List<DepartureResponse> departureResponses = upcoming.stream()
                .map(this::toDepartureResponse)
                .collect(Collectors.toList());

        return TourResponse.builder()
                .id(tour.getId())
                .destinationId(tour.getDestination().getId())
                .destinationName(tour.getDestination().getName())
                .city(tour.getDestination().getCity())
                .country(tour.getDestination().getCountry())
                .title(tour.getTitle())
                .description(tour.getDescription())
                .durationDays(tour.getDurationDays())
                .basePrice(tour.getBasePrice())
                .status(tour.getStatus().name())
                .upcomingDepartures(departureResponses)
                .build();
    }

    private DepartureResponse toDepartureResponse(TourDeparture d) {
        return DepartureResponse.builder()
                .id(d.getId())
                .tourId(d.getTour().getId())
                .departureDate(d.getDepartureDate())
                .returnDate(d.getReturnDate())
                .price(d.getPrice())
                .totalSeats(d.getTotalSeats())
                .availableSeats(d.getAvailableSeats())
                .status(d.getStatus().name())
                .build();
    }
}

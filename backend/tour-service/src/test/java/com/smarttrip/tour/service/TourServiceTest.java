package com.smarttrip.tour.service;

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
import com.smarttrip.tour.service.impl.TourServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TourServiceTest {

    @Mock
    private TourRepository tourRepository;

    @Mock
    private DestinationRepository destinationRepository;

    @Mock
    private TourDepartureRepository departureRepository;

    @InjectMocks
    private TourServiceImpl tourService;

    private Destination sampleDestination;
    private Tour sampleTour;
    private TourDeparture sampleDeparture;

    @BeforeEach
    void setUp() {
        sampleDestination = Destination.builder()
                .id(1L)
                .name("Ba Na Hills")
                .city("Da Nang")
                .country("Vietnam")
                .build();

        sampleTour = Tour.builder()
                .id(10L)
                .destination(sampleDestination)
                .title("Da Nang Discovery 3D2N")
                .description("Explore Ba Na Hills and Marble Mountains")
                .durationDays(3)
                .basePrice(new BigDecimal("2500000.00"))
                .status(TourStatus.PUBLISHED)
                .createdBy(100L)
                .departures(new ArrayList<>())
                .build();

        sampleDeparture = TourDeparture.builder()
                .id(1001L)
                .tour(sampleTour)
                .departureDate(LocalDate.now().plusDays(10))
                .returnDate(LocalDate.now().plusDays(13))
                .price(new BigDecimal("2500000.00"))
                .totalSeats(20)
                .availableSeats(15)
                .status(DepartureStatus.SCHEDULED)
                .build();
    }

    @Test
    void testCreateTour_Success() {
        CreateTourRequest request = CreateTourRequest.builder()
                .destinationId(1L)
                .title("Da Nang Discovery 3D2N")
                .description("Explore Da Nang")
                .durationDays(3)
                .basePrice(new BigDecimal("2500000.00"))
                .build();

        when(destinationRepository.findById(1L)).thenReturn(Optional.of(sampleDestination));
        when(tourRepository.save(any(Tour.class))).thenAnswer(inv -> {
            Tour t = inv.getArgument(0);
            t.setId(10L);
            return t;
        });
        when(departureRepository.findByTourIdAndDepartureDateAfterAndStatusOrderByDepartureDateAsc(any(), any(), any()))
                .thenReturn(List.of());

        TourResponse response = tourService.createTour(request, 100L);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Da Nang Discovery 3D2N", response.getTitle());
        assertEquals("Ba Na Hills", response.getDestinationName());
        verify(tourRepository).save(any(Tour.class));
    }

    @Test
    void testCreateTour_DestinationNotFound_ThrowsResourceNotFoundException() {
        CreateTourRequest request = CreateTourRequest.builder()
                .destinationId(99L)
                .title("Tour")
                .build();

        when(destinationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> tourService.createTour(request, 100L));
        verify(tourRepository, never()).save(any());
    }

    @Test
    void testGetTourById_Success() {
        when(tourRepository.findById(10L)).thenReturn(Optional.of(sampleTour));
        when(departureRepository.findByTourIdAndDepartureDateAfterAndStatusOrderByDepartureDateAsc(eq(10L), any(), any()))
                .thenReturn(List.of(sampleDeparture));

        TourResponse response = tourService.getTourById(10L);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Da Nang Discovery 3D2N", response.getTitle());
        assertEquals(1, response.getUpcomingDepartures().size());
        assertEquals(1001L, response.getUpcomingDepartures().get(0).getId());
    }

    @Test
    void testGetTourById_NotFound_ThrowsResourceNotFoundException() {
        when(tourRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> tourService.getTourById(99L));
    }

    @Test
    void testAddDeparture_Success() {
        CreateDepartureRequest request = CreateDepartureRequest.builder()
                .departureDate(LocalDate.now().plusDays(5))
                .returnDate(LocalDate.now().plusDays(8))
                .price(new BigDecimal("2600000.00"))
                .totalSeats(30)
                .build();

        when(tourRepository.findById(10L)).thenReturn(Optional.of(sampleTour));
        when(departureRepository.save(any(TourDeparture.class))).thenAnswer(inv -> {
            TourDeparture d = inv.getArgument(0);
            d.setId(2001L);
            return d;
        });

        DepartureResponse response = tourService.addDeparture(10L, request);

        assertNotNull(response);
        assertEquals(2001L, response.getId());
        assertEquals(30, response.getAvailableSeats());
        assertEquals("SCHEDULED", response.getStatus());
    }

    @Test
    void testAddDeparture_TourNotFound_ThrowsResourceNotFoundException() {
        CreateDepartureRequest request = CreateDepartureRequest.builder()
                .departureDate(LocalDate.now().plusDays(5))
                .returnDate(LocalDate.now().plusDays(8))
                .build();

        when(tourRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> tourService.addDeparture(99L, request));
    }

    @Test
    void testAddDeparture_DepartureDateInPast_ThrowsBusinessException() {
        CreateDepartureRequest request = CreateDepartureRequest.builder()
                .departureDate(LocalDate.now().minusDays(1))
                .returnDate(LocalDate.now().plusDays(2))
                .totalSeats(20)
                .build();

        when(tourRepository.findById(10L)).thenReturn(Optional.of(sampleTour));

        assertThrows(BusinessException.class, () -> tourService.addDeparture(10L, request));
    }

    @Test
    void testAddDeparture_ReturnDateBeforeDepartureDate_ThrowsBusinessException() {
        CreateDepartureRequest request = CreateDepartureRequest.builder()
                .departureDate(LocalDate.now().plusDays(5))
                .returnDate(LocalDate.now().plusDays(3))
                .totalSeats(20)
                .build();

        when(tourRepository.findById(10L)).thenReturn(Optional.of(sampleTour));

        assertThrows(BusinessException.class, () -> tourService.addDeparture(10L, request));
    }

    @Test
    void testAddDeparture_TotalSeatsNonPositive_ThrowsBusinessException() {
        CreateDepartureRequest request = CreateDepartureRequest.builder()
                .departureDate(LocalDate.now().plusDays(5))
                .returnDate(LocalDate.now().plusDays(8))
                .totalSeats(0)
                .build();

        when(tourRepository.findById(10L)).thenReturn(Optional.of(sampleTour));

        assertThrows(BusinessException.class, () -> tourService.addDeparture(10L, request));
    }

    @Test
    void testGetDepartureSnapshot_Active() {
        when(departureRepository.findById(1001L)).thenReturn(Optional.of(sampleDeparture));

        DepartureSnapshotResponse response = tourService.getDepartureSnapshot(1001L);

        assertNotNull(response);
        assertEquals(1001L, response.getDepartureId());
        assertEquals(10L, response.getTourId());
        assertEquals("Da Nang Discovery 3D2N", response.getTourTitle());
        assertEquals("Ba Na Hills", response.getDestinationName());
        assertEquals(15, response.getAvailableSeats());
        assertTrue(response.isActive());
    }

    @Test
    void testGetDepartureSnapshot_NoAvailableSeats_Inactive() {
        sampleDeparture.setAvailableSeats(0);
        when(departureRepository.findById(1001L)).thenReturn(Optional.of(sampleDeparture));

        DepartureSnapshotResponse response = tourService.getDepartureSnapshot(1001L);

        assertNotNull(response);
        assertFalse(response.isActive());
    }

    @Test
    void testGetDepartureSnapshot_NotFound_ThrowsResourceNotFoundException() {
        when(departureRepository.findById(9999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> tourService.getDepartureSnapshot(9999L));
    }

    @Test
    void testSearchTours_Success() {
        Page<Tour> tourPage = new PageImpl<>(List.of(sampleTour));
        when(tourRepository.searchTours(eq(TourStatus.PUBLISHED), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(tourPage);
        when(departureRepository.findByTourIdAndDepartureDateAfterAndStatusOrderByDepartureDateAsc(eq(10L), any(), any()))
                .thenReturn(List.of(sampleDeparture));

        Page<TourResponse> result = tourService.searchTours("Da Nang", null, null, null, 0, 10);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Da Nang Discovery 3D2N", result.getContent().get(0).getTitle());
    }
}

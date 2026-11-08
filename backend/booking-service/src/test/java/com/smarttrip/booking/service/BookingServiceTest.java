package com.smarttrip.booking.service;

import com.smarttrip.booking.client.TourFeignClient;
import com.smarttrip.booking.client.UserFeignClient;
import com.smarttrip.booking.client.dto.DepartureSnapshotDto;
import com.smarttrip.booking.client.dto.UserStatusDto;
import com.smarttrip.booking.dto.*;
import com.smarttrip.booking.entity.Booking;
import com.smarttrip.booking.entity.BookingItem;
import com.smarttrip.booking.entity.SagaInstance;
import com.smarttrip.booking.exception.BusinessException;
import com.smarttrip.booking.exception.ResourceNotFoundException;
import com.smarttrip.booking.exception.UserBlockedException;
import com.smarttrip.booking.repository.BookingRepository;
import com.smarttrip.booking.repository.SagaInstanceRepository;
import com.smarttrip.booking.saga.BookingSagaOrchestrator;
import com.smarttrip.booking.service.impl.BookingServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private SagaInstanceRepository sagaInstanceRepository;

    @Mock
    private UserFeignClient userFeignClient;

    @Mock
    private TourFeignClient tourFeignClient;

    @Mock
    private BookingSagaOrchestrator sagaOrchestrator;

    @InjectMocks
    private BookingServiceImpl bookingService;

    @Test
    @DisplayName("Should successfully create a booking with status PENDING, snapshots, and Saga initialization")
    void createBooking_successWithSnapshotsAndSaga() {
        BookingCreateRequest request = BookingCreateRequest.builder()
                .customerId(10L)
                .tourId(101L)
                .departureId(201L)
                .tourName("Da Nang - Hoi An 3D2N")
                .departureDate(LocalDate.of(2026, 12, 1))
                .unitPrice(new BigDecimal("3500000.00"))
                .quantity(2)
                .passengers(List.of(
                        BookingPassengerRequest.builder()
                                .fullName("Nguyen Van A")
                                .phone("0901234567")
                                .dateOfBirth(LocalDate.of(1995, 5, 20))
                                .build(),
                        BookingPassengerRequest.builder()
                                .fullName("Tran Thi B")
                                .phone("0907654321")
                                .dateOfBirth(LocalDate.of(1998, 8, 15))
                                .build()
                ))
                .hotelDetails(List.of(
                        BookingHotelDetailRequest.builder()
                                .hotelId(501L)
                                .hotelName("Grand Tourane Hotel")
                                .roomTypeId(801L)
                                .roomName("Deluxe Ocean View")
                                .checkInDate(LocalDate.of(2026, 12, 1))
                                .checkOutDate(LocalDate.of(2026, 12, 3))
                                .roomQuantity(1)
                                .price(new BigDecimal("1200000.00"))
                                .build()
                ))
                .idempotencyKey("idem-book-100")
                .build();

        when(userFeignClient.getUserStatus(10L)).thenReturn(UserStatusDto.builder()
                .userId(10L).email("user10@smarttrip.com").status("ACTIVE").active(true).build());
        when(tourFeignClient.getDepartureSnapshot(201L)).thenReturn(DepartureSnapshotDto.builder()
                .departureId(201L).tourId(101L).tourTitle("Da Nang - Hoi An 3D2N")
                .price(new BigDecimal("3500000.00")).totalSeats(30).availableSeats(20).active(true).build());

        when(bookingRepository.findByIdempotencyKey("idem-book-100")).thenReturn(Optional.empty());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(1L);
            return b;
        });

        BookingResponse response = bookingService.createBooking(request);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo("PENDING");
        assertThat(response.getBookingCode()).startsWith("BK-");
        assertThat(response.getTotalAmount()).isEqualByComparingTo("8200000.00");
        assertThat(response.getItems()).hasSize(1);
        assertThat(response.getItems().get(0).getTourNameSnapshot()).isEqualTo("Da Nang - Hoi An 3D2N");
        assertThat(response.getItems().get(0).getUnitPriceSnapshot()).isEqualByComparingTo("3500000.00");
        assertThat(response.getPassengers()).hasSize(2);
        assertThat(response.getHotelDetails()).hasSize(1);
        assertThat(response.getHotelDetails().get(0).getHotelNameSnapshot()).isEqualTo("Grand Tourane Hotel");
        assertThat(response.getHotelDetails().get(0).getPriceSnapshot()).isEqualByComparingTo("1200000.00");

        ArgumentCaptor<SagaInstance> sagaCaptor = ArgumentCaptor.forClass(SagaInstance.class);
        verify(sagaInstanceRepository, times(1)).save(sagaCaptor.capture());
        SagaInstance capturedSaga = sagaCaptor.getValue();
        assertThat(capturedSaga.getSagaType()).isEqualTo("BOOKING_CREATE");
        assertThat(capturedSaga.getStatus()).isEqualTo("STARTED");
        assertThat(capturedSaga.getCurrentStep()).isEqualTo("PENDING_CONFIRMATION");

        verify(sagaOrchestrator, times(1)).startSaga(any(Booking.class), any(SagaInstance.class));
    }

    @Test
    @DisplayName("OpenFeign Scenario 1: Should throw UserBlockedException (403 Forbidden) when user is BLOCKED")
    void createBooking_whenUserIsBlocked_throwsUserBlockedException() {
        BookingCreateRequest request = BookingCreateRequest.builder()
                .customerId(99L)
                .tourId(101L)
                .departureId(201L)
                .unitPrice(new BigDecimal("1000000.00"))
                .quantity(1)
                .build();

        when(userFeignClient.getUserStatus(99L)).thenReturn(UserStatusDto.builder()
                .userId(99L)
                .email("blocked@smarttrip.com")
                .status("BLOCKED")
                .active(false)
                .build());

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(UserBlockedException.class)
                .hasMessageContaining("User account is BLOCKED");

        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("OpenFeign Scenario 2: Should throw BusinessException when available seats are insufficient")
    void createBooking_whenNotEnoughSeats_throwsBusinessException() {
        BookingCreateRequest request = BookingCreateRequest.builder()
                .customerId(10L)
                .tourId(101L)
                .departureId(201L)
                .unitPrice(new BigDecimal("1000000.00"))
                .quantity(5)
                .build();

        when(userFeignClient.getUserStatus(10L)).thenReturn(UserStatusDto.builder()
                .userId(10L).active(true).status("ACTIVE").build());
        when(tourFeignClient.getDepartureSnapshot(201L)).thenReturn(DepartureSnapshotDto.builder()
                .departureId(201L).availableSeats(2).active(true).build());

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Not enough available seats");

        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should return existing booking when repeated idempotencyKey is used")
    void createBooking_idempotent() {
        Booking existingBooking = Booking.builder()
                .id(99L)
                .bookingCode("BK-EXISTING-99")
                .customerId(10L)
                .status("PENDING")
                .totalAmount(new BigDecimal("3500000.00"))
                .idempotencyKey("dup-booking-key")
                .build();

        BookingCreateRequest request = BookingCreateRequest.builder()
                .customerId(10L)
                .tourId(101L)
                .departureId(201L)
                .unitPrice(new BigDecimal("3500000.00"))
                .quantity(1)
                .idempotencyKey("dup-booking-key")
                .build();

        when(userFeignClient.getUserStatus(10L)).thenReturn(UserStatusDto.builder()
                .userId(10L).active(true).status("ACTIVE").build());
        when(tourFeignClient.getDepartureSnapshot(201L)).thenReturn(DepartureSnapshotDto.builder()
                .departureId(201L).availableSeats(10).active(true).build());
        when(bookingRepository.findByIdempotencyKey("dup-booking-key")).thenReturn(Optional.of(existingBooking));

        BookingResponse response = bookingService.createBooking(request);

        assertThat(response.getBookingCode()).isEqualTo("BK-EXISTING-99");
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw BusinessException when customerId is missing")
    void createBooking_missingCustomerId_throwsException() {
        BookingCreateRequest request = BookingCreateRequest.builder()
                .quantity(1)
                .unitPrice(new BigDecimal("1000000.00"))
                .build();

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Customer ID is required");
    }

    @Test
    @DisplayName("Should throw BusinessException when quantity is less than 1")
    void createBooking_invalidQuantity_throwsException() {
        BookingCreateRequest request = BookingCreateRequest.builder()
                .customerId(10L)
                .quantity(0)
                .unitPrice(new BigDecimal("1000000.00"))
                .build();

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Quantity must be at least 1");
    }

    @Test
    @DisplayName("Should throw BusinessException when unitPrice is zero or negative")
    void createBooking_invalidUnitPrice_throwsException() {
        BookingCreateRequest request = BookingCreateRequest.builder()
                .customerId(10L)
                .quantity(1)
                .unitPrice(BigDecimal.ZERO)
                .build();

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Tour unit price must be greater than zero");
    }

    @Test
    @DisplayName("Should retrieve booking by booking code")
    void getBookingByCode_success() {
        Booking booking = Booking.builder()
                .id(1L)
                .bookingCode("BK-20261201-ABCD")
                .customerId(10L)
                .status("PENDING")
                .totalAmount(new BigDecimal("5000000.00"))
                .build();

        when(bookingRepository.findByBookingCode("BK-20261201-ABCD")).thenReturn(Optional.of(booking));

        BookingResponse response = bookingService.getBookingByCode("BK-20261201-ABCD");

        assertThat(response.getBookingCode()).isEqualTo("BK-20261201-ABCD");
        assertThat(response.getStatus()).isEqualTo("PENDING");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when booking code does not exist")
    void getBookingByCode_notFound_throwsException() {
        when(bookingRepository.findByBookingCode("NON_EXISTENT")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.getBookingByCode("NON_EXISTENT"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Booking not found");
    }

    @Test
    @DisplayName("Should get list of bookings by customer ID")
    void getBookingsByCustomerId_success() {
        Booking b1 = Booking.builder()
                .id(1L)
                .bookingCode("BK-1")
                .customerId(10L)
                .status("CONFIRMED")
                .totalAmount(new BigDecimal("2000000.00"))
                .build();
        Booking b2 = Booking.builder()
                .id(2L)
                .bookingCode("BK-2")
                .customerId(10L)
                .status("PENDING")
                .totalAmount(new BigDecimal("3000000.00"))
                .build();

        when(bookingRepository.findByCustomerIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(b2, b1));

        List<BookingResponse> list = bookingService.getBookingsByCustomerId(10L);

        assertThat(list).hasSize(2);
        assertThat(list.get(0).getBookingCode()).isEqualTo("BK-2");
        assertThat(list.get(1).getBookingCode()).isEqualTo("BK-1");
    }
}

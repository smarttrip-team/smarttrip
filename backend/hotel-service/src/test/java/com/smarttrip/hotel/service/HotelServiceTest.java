package com.smarttrip.hotel.service;

import com.smarttrip.hotel.client.UserFeignClient;
import com.smarttrip.hotel.dto.HotelAvailabilityResponse;
import com.smarttrip.hotel.dto.HotelCreateRequest;
import com.smarttrip.hotel.dto.HotelResponse;
import com.smarttrip.hotel.dto.RoomTypeAvailabilityResponse;
import com.smarttrip.hotel.entity.Hotel;
import com.smarttrip.hotel.entity.RoomInventory;
import com.smarttrip.hotel.entity.RoomType;
import com.smarttrip.hotel.exception.BusinessException;
import com.smarttrip.hotel.exception.ResourceNotFoundException;
import com.smarttrip.hotel.repository.HotelRepository;
import com.smarttrip.hotel.repository.RoomInventoryRepository;
import com.smarttrip.hotel.repository.RoomTypeRepository;
import com.smarttrip.hotel.service.impl.HotelServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HotelServiceTest {

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private RoomTypeRepository roomTypeRepository;

    @Mock
    private RoomInventoryRepository roomInventoryRepository;

    @Mock
    private UserFeignClient userFeignClient;

    @InjectMocks
    private HotelServiceImpl hotelService;

    private Hotel sampleHotel;
    private RoomType sampleRoomType;

    @BeforeEach
    void setUp() {
        sampleHotel = Hotel.builder()
                .id(1L)
                .managerId(10L)
                .name("Grand SmartTrip Hotel")
                .address("123 Vo Nguyen Giap, Da Nang")
                .description("Beachfront luxury hotel")
                .status("ACTIVE")
                .roomTypes(new ArrayList<>())
                .build();

        sampleRoomType = RoomType.builder()
                .id(101L)
                .hotel(sampleHotel)
                .name("Deluxe Ocean View")
                .capacity(2)
                .basePrice(new BigDecimal("1500000.00"))
                .status("ACTIVE")
                .build();

        sampleHotel.getRoomTypes().add(sampleRoomType);
    }

    @Test
    void testGetHotelById_Success() {
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(sampleHotel));

        HotelResponse response = hotelService.getHotelById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Grand SmartTrip Hotel", response.getName());
        assertEquals(1, response.getRoomTypes().size());
    }

    @Test
    void testGetHotelById_NotFound() {
        when(hotelRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> hotelService.getHotelById(99L));
    }

    @Test
    void testCreateHotel_Success() {
        HotelCreateRequest request = HotelCreateRequest.builder()
                .name("New Hotel")
                .address("456 Tran Phu, Da Nang")
                .description("City center")
                .managerId(10L)
                .build();

        when(userFeignClient.verifyRole(10L, "ROLE_HOTEL_MANAGER"))
                .thenReturn(Map.of("verified", true));

        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> {
            Hotel h = invocation.getArgument(0);
            h.setId(2L);
            return h;
        });

        HotelResponse response = hotelService.createHotel(request);

        assertNotNull(response);
        assertEquals(2L, response.getId());
        assertEquals("New Hotel", response.getName());
        verify(userFeignClient).verifyRole(10L, "ROLE_HOTEL_MANAGER");
    }

    @Test
    void testCreateHotel_ManagerRoleNotVerified_ThrowsBusinessException() {
        HotelCreateRequest request = HotelCreateRequest.builder()
                .name("New Hotel")
                .address("456 Tran Phu, Da Nang")
                .description("City center")
                .managerId(10L)
                .build();

        when(userFeignClient.verifyRole(10L, "ROLE_HOTEL_MANAGER"))
                .thenReturn(Map.of("verified", false));

        assertThrows(BusinessException.class, () -> hotelService.createHotel(request));
        verify(hotelRepository, never()).save(any());
    }

    @Test
    void testCheckAvailability_CalculatesMinimumAvailableRoomsCorrectly() {
        LocalDate checkIn = LocalDate.of(2026, 12, 1);
        LocalDate checkOut = LocalDate.of(2026, 12, 4); // 3 nights: Dec 1, Dec 2, Dec 3

        when(hotelRepository.findById(1L)).thenReturn(Optional.of(sampleHotel));

        // Dec 1: 5 rooms, Dec 2: 2 rooms (bottleneck), Dec 3: 4 rooms
        List<RoomInventory> inventories = List.of(
                RoomInventory.builder().roomType(sampleRoomType).inventoryDate(LocalDate.of(2026, 12, 1)).totalRooms(10).availableRooms(5).build(),
                RoomInventory.builder().roomType(sampleRoomType).inventoryDate(LocalDate.of(2026, 12, 2)).totalRooms(10).availableRooms(2).build(),
                RoomInventory.builder().roomType(sampleRoomType).inventoryDate(LocalDate.of(2026, 12, 3)).totalRooms(10).availableRooms(4).build()
        );

        when(roomInventoryRepository.findByRoomTypeIdAndInventoryDateBetween(101L, checkIn, LocalDate.of(2026, 12, 3)))
                .thenReturn(inventories);

        HotelAvailabilityResponse response = hotelService.checkAvailability(1L, checkIn, checkOut, 101L);

        assertNotNull(response);
        assertEquals(3, response.getNumberOfNights());
        assertEquals(1, response.getRoomAvailabilities().size());

        RoomTypeAvailabilityResponse roomAvail = response.getRoomAvailabilities().get(0);
        assertEquals(101L, roomAvail.getRoomTypeId());
        // Minimum available across the 3 nights must be 2
        assertEquals(2, roomAvail.getMinAvailableRooms());
        assertTrue(roomAvail.isAvailable());
    }

    @Test
    void testCheckAvailability_MissingDateYieldsZeroAvailability() {
        LocalDate checkIn = LocalDate.of(2026, 12, 1);
        LocalDate checkOut = LocalDate.of(2026, 12, 4);

        when(hotelRepository.findById(1L)).thenReturn(Optional.of(sampleHotel));

        // Dec 2 is missing from inventory
        List<RoomInventory> inventories = List.of(
                RoomInventory.builder().roomType(sampleRoomType).inventoryDate(LocalDate.of(2026, 12, 1)).totalRooms(10).availableRooms(5).build(),
                RoomInventory.builder().roomType(sampleRoomType).inventoryDate(LocalDate.of(2026, 12, 3)).totalRooms(10).availableRooms(4).build()
        );

        when(roomInventoryRepository.findByRoomTypeIdAndInventoryDateBetween(101L, checkIn, LocalDate.of(2026, 12, 3)))
                .thenReturn(inventories);

        HotelAvailabilityResponse response = hotelService.checkAvailability(1L, checkIn, checkOut, 101L);

        RoomTypeAvailabilityResponse roomAvail = response.getRoomAvailabilities().get(0);
        assertEquals(0, roomAvail.getMinAvailableRooms());
        assertFalse(roomAvail.isAvailable());
    }

    @Test
    void testCheckAvailability_InvalidDateRange_ThrowsBusinessException() {
        LocalDate checkIn = LocalDate.of(2026, 12, 5);
        LocalDate checkOut = LocalDate.of(2026, 12, 2);

        assertThrows(BusinessException.class, () -> hotelService.checkAvailability(1L, checkIn, checkOut, null));
    }
}

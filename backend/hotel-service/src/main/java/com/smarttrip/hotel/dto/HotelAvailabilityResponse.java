package com.smarttrip.hotel.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelAvailabilityResponse {
    private Long hotelId;
    private String hotelName;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private long numberOfNights;
    private List<RoomTypeAvailabilityResponse> roomAvailabilities;
}

package com.smarttrip.hotel.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelResponse {
    private Long id;
    private Long managerId;
    private String name;
    private String address;
    private String description;
    private String status;
    private List<RoomTypeResponse> roomTypes;
}

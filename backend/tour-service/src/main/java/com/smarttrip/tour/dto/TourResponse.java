package com.smarttrip.tour.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourResponse {
    private Long id;
    private Long operatorId;
    private String name;
    private String description;
    private String destination;
    private Integer durationDays;
    private BigDecimal basePrice;
    private String status;
    private List<DepartureResponse> departures;
}

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
    private Long destinationId;
    private String destinationName;
    private String city;
    private String country;
    private String title;
    private String description;
    private Integer durationDays;
    private BigDecimal basePrice;
    private String coverImageUrl;
    private String status;
    private List<DepartureResponse> upcomingDepartures;
}

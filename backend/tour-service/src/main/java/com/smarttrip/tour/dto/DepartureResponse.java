package com.smarttrip.tour.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartureResponse {
    private Long id;
    private Long tourId;
    private LocalDate departureDate;
    private LocalDate returnDate;
    private BigDecimal price;
    private Integer totalSeats;
    private Integer availableSeats;
    private String status;
}

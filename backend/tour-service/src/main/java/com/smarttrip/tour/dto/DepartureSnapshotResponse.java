package com.smarttrip.tour.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartureSnapshotResponse {
    private Long departureId;
    private Long tourId;
    private String tourTitle;
    private String destinationName;
    private LocalDate departureDate;
    private LocalDate returnDate;
    private BigDecimal price;
    private Integer totalSeats;
    private Integer availableSeats;
    private String status;
    private boolean active;
}

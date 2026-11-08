package com.smarttrip.booking.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartureSnapshotDto {
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

package com.smarttrip.booking.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingCreateRequest {

    private Long customerId;

    @NotNull(message = "tourId is required")
    private Long tourId;

    @NotNull(message = "departureId is required")
    private Long departureId;

    @NotBlank(message = "tourName is required")
    private String tourName;

    @NotNull(message = "departureDate is required")
    private LocalDate departureDate;

    @NotNull(message = "unitPrice is required")
    @DecimalMin(value = "0.01", message = "Tour unit price must be greater than zero")
    private BigDecimal unitPrice;

    @NotNull(message = "quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @Valid
    @Builder.Default
    private List<BookingPassengerRequest> passengers = new ArrayList<>();

    @Valid
    @Builder.Default
    private List<BookingHotelDetailRequest> hotelDetails = new ArrayList<>();

    private String idempotencyKey;
}

package com.smarttrip.booking.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingHotelDetailRequest {

    @NotNull(message = "hotelId is required")
    private Long hotelId;

    @NotBlank(message = "hotelName is required")
    private String hotelName;

    @NotNull(message = "roomTypeId is required")
    private Long roomTypeId;

    @NotBlank(message = "roomName is required")
    private String roomName;

    @NotNull(message = "checkInDate is required")
    private LocalDate checkInDate;

    @NotNull(message = "checkOutDate is required")
    private LocalDate checkOutDate;

    @NotNull(message = "roomQuantity is required")
    @Min(value = 1, message = "roomQuantity must be at least 1")
    private Integer roomQuantity;

    @NotNull(message = "price is required")
    @DecimalMin(value = "0.00", message = "Price cannot be negative")
    private BigDecimal price;
}

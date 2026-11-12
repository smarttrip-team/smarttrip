package com.smarttrip.booking.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class BookingCreateRequest {

    private Long customerId;

    private Long tourId;

    private Long departureId;

    private Long tourDepartureId;

    private String tourName;

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

    private String contactName;
    private String contactPhone;
    private String contactEmail;

    public Long getDepartureId() {
        return departureId != null ? departureId : tourDepartureId;
    }

    public void setTourDepartureId(Long tourDepartureId) {
        this.tourDepartureId = tourDepartureId;
        if (this.departureId == null) {
            this.departureId = tourDepartureId;
        }
    }

    @JsonProperty("hotelReservation")
    public void setHotelReservation(BookingHotelDetailRequest hr) {
        if (hr != null) {
            if (this.hotelDetails == null) {
                this.hotelDetails = new ArrayList<>();
            }
            this.hotelDetails.add(hr);
        }
    }
}

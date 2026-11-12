package com.smarttrip.booking.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class BookingPassengerRequest {

    @NotBlank(message = "Passenger full name is required")
    private String fullName;

    private String phone;

    private LocalDate dateOfBirth;

    private String passengerType;
}

package com.smarttrip.booking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingPassengerRequest {

    @NotBlank(message = "Passenger full name is required")
    private String fullName;

    private String phone;

    private LocalDate dateOfBirth;
}

package com.smarttrip.booking.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingPassengerResponse {
    private Long id;
    private String fullName;
    private String phone;
    private LocalDate dateOfBirth;
}

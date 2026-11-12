package com.smarttrip.booking.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class BookingHotelDetailRequest {

    @NotNull(message = "hotelId is required")
    private Long hotelId;

    private String hotelName;

    @NotNull(message = "roomTypeId is required")
    private Long roomTypeId;

    private String roomName;

    @NotNull(message = "checkInDate is required")
    private LocalDate checkInDate;

    @NotNull(message = "checkOutDate is required")
    private LocalDate checkOutDate;

    private Integer roomQuantity;

    private BigDecimal price;

    @JsonProperty("roomsBooked")
    public void setRoomsBooked(Integer roomsBooked) {
        if (this.roomQuantity == null) {
            this.roomQuantity = roomsBooked;
        }
    }

    @JsonProperty("unitPrice")
    public void setUnitPrice(BigDecimal unitPrice) {
        if (this.price == null) {
            this.price = unitPrice;
        }
    }

    public String getHotelName() {
        return (hotelName != null && !hotelName.isBlank()) ? hotelName : "Khách sạn Novotel Danang Premier";
    }

    public String getRoomName() {
        return (roomName != null && !roomName.isBlank()) ? roomName : "Deluxe Ocean View Room";
    }

    public Integer getRoomQuantity() {
        return (roomQuantity != null && roomQuantity > 0) ? roomQuantity : 1;
    }

    public BigDecimal getPrice() {
        return price != null ? price : BigDecimal.valueOf(1200000);
    }
}

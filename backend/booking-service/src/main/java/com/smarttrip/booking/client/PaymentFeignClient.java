package com.smarttrip.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;

@FeignClient(name = "payment-service")
public interface PaymentFeignClient {

    @PostMapping("/api/v1/payments/settlement")
    void settleRevenue(
            @RequestParam("bookingCode") String bookingCode,
            @RequestParam("operatorId") Long operatorId,
            @RequestParam("tourAmount") BigDecimal tourAmount,
            @RequestParam("hotelierId") Long hotelierId,
            @RequestParam("hotelAmount") BigDecimal hotelAmount);
}

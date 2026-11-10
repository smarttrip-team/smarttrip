package com.smarttrip.booking.client;

import com.smarttrip.booking.client.dto.DepartureSnapshotDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "tour-service")
public interface TourFeignClient {

    @GetMapping("/internal/v1/departures/{id}")
    DepartureSnapshotDto getDepartureSnapshot(@PathVariable("id") Long id);
}

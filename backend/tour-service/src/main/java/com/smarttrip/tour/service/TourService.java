package com.smarttrip.tour.service;

import com.smarttrip.tour.dto.TourResponse;
import java.util.List;

public interface TourService {
    List<TourResponse> getAllTours();
    TourResponse getTourById(Long id);
}

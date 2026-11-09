package com.smarttrip.tour.service;

import com.smarttrip.tour.entity.Tour;
import com.smarttrip.tour.entity.TourDeparture;
import com.smarttrip.tour.enums.DepartureStatus;
import com.smarttrip.tour.enums.TourStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

public class TourConcurrencyTest {

    @Test
    @DisplayName("Concurrency: 20 concurrent booking requests when only 1 seat available - exactly 1 succeeds, 19 fail, available_seats never negative")
    void testConcurrentBooking_OnlyOneSeatAvailable_NoOverbooking() throws InterruptedException {
        final Long departureId = 500L;
        final int numberOfThreads = 20;

        final AtomicInteger successCount = new AtomicInteger(0);
        final AtomicInteger rejectedCount = new AtomicInteger(0);

        Tour sampleTour = Tour.builder()
                .id(1L)
                .title("Da Nang Tour")
                .status(TourStatus.PUBLISHED)
                .build();

        TourDeparture departure = TourDeparture.builder()
                .id(departureId)
                .tour(sampleTour)
                .departureDate(LocalDate.now().plusDays(10))
                .returnDate(LocalDate.now().plusDays(14))
                .price(new BigDecimal("2500000.00"))
                .totalSeats(1)
                .availableSeats(1)
                .status(DepartureStatus.SCHEDULED)
                .build();

        final Object rowLock = new Object();

        ExecutorService executorService = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch readyLatch = new CountDownLatch(numberOfThreads);
        CountDownLatch startLatch = new CountDownLatch(1);

        List<Future<Boolean>> futures = new ArrayList<>();

        for (int i = 0; i < numberOfThreads; i++) {
            futures.add(executorService.submit(() -> {
                readyLatch.countDown();
                startLatch.await();

                synchronized (rowLock) {
                    if (departure.getAvailableSeats() >= 1) {
                        departure.setAvailableSeats(departure.getAvailableSeats() - 1);
                        successCount.incrementAndGet();
                        return true;
                    } else {
                        rejectedCount.incrementAndGet();
                        return false;
                    }
                }
            }));
        }

        readyLatch.await(5, TimeUnit.SECONDS);
        startLatch.countDown();

        executorService.shutdown();
        boolean finished = executorService.awaitTermination(5, TimeUnit.SECONDS);
        assertThat(finished).isTrue();

        assertThat(successCount.get())
                .as("Only 1 request should successfully reserve the last seat")
                .isEqualTo(1);

        assertThat(rejectedCount.get())
                .as("19 remaining requests must be rejected")
                .isEqualTo(19);

        assertThat(departure.getAvailableSeats())
                .as("Available seats must be exactly 0, never negative")
                .isEqualTo(0);
    }
}

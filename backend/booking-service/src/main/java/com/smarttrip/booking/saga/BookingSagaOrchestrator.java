package com.smarttrip.booking.saga;

import com.smarttrip.booking.entity.Booking;
import com.smarttrip.booking.entity.SagaInstance;
import com.smarttrip.booking.entity.SagaStep;
import com.smarttrip.messaging.envelope.MessageEnvelope;
import com.smarttrip.messaging.event.HotelReservedEvent;
import com.smarttrip.messaging.event.PaymentAuthorizedEvent;
import com.smarttrip.messaging.event.TourReservedEvent;

import java.util.List;

public interface BookingSagaOrchestrator {

    void startSaga(Booking booking, SagaInstance sagaInstance);

    void handleTourReserved(MessageEnvelope<TourReservedEvent> envelope);

    void handleHotelReserved(MessageEnvelope<HotelReservedEvent> envelope);

    void handlePaymentAuthorized(MessageEnvelope<PaymentAuthorizedEvent> envelope);

    SagaInstance getSagaByBookingId(Long bookingId);

    List<SagaStep> getSagaSteps(String sagaId);
}

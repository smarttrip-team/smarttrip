package com.smarttrip.booking.saga;

import com.smarttrip.booking.entity.Booking;
import com.smarttrip.booking.entity.SagaInstance;
import com.smarttrip.booking.entity.SagaStep;
import com.smarttrip.messaging.envelope.MessageEnvelope;
import com.smarttrip.messaging.event.*;

import java.util.List;

public interface BookingSagaOrchestrator {

    void startSaga(Booking booking, SagaInstance sagaInstance);

    void handleTourReserved(MessageEnvelope<TourReservedEvent> envelope);

    void handleHotelReserved(MessageEnvelope<HotelReservedEvent> envelope);

    void handlePaymentAuthorized(MessageEnvelope<PaymentAuthorizedEvent> envelope);

    void handleTourReserveFailed(MessageEnvelope<TourReserveFailedEvent> envelope);

    void handleHotelReserveFailed(MessageEnvelope<HotelReserveFailedEvent> envelope);

    void handlePaymentAuthorizeFailed(MessageEnvelope<PaymentAuthorizeFailedEvent> envelope);

    SagaInstance getSagaByBookingId(Long bookingId);

    List<SagaStep> getSagaSteps(String sagaId);
}

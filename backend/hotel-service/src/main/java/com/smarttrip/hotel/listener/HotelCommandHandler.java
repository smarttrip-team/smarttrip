package com.smarttrip.hotel.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttrip.hotel.entity.RoomInventory;
import com.smarttrip.hotel.idempotency.IdempotentConsumerService;
import com.smarttrip.hotel.outbox.OutboxPublisher;
import com.smarttrip.hotel.repository.RoomInventoryRepository;
import com.smarttrip.messaging.command.ConfirmHotelCommand;
import com.smarttrip.messaging.command.ReleaseHotelCommand;
import com.smarttrip.messaging.command.ReserveHotelCommand;
import com.smarttrip.messaging.constant.RabbitMQConstants;
import com.smarttrip.messaging.envelope.MessageEnvelope;
import com.smarttrip.messaging.event.HotelReserveFailedEvent;
import com.smarttrip.messaging.event.HotelReservedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class HotelCommandHandler {

    private final RoomInventoryRepository roomInventoryRepository;
    private final IdempotentConsumerService idempotentConsumerService;
    private final OutboxPublisher outboxPublisher;
    private final ObjectMapper messagingObjectMapper;

    @RabbitListener(queues = RabbitMQConstants.QUEUE_HOTEL_COMMANDS)
    @Transactional
    public void onHotelCommand(MessageEnvelope<Object> envelope) {
        if (envelope == null || envelope.getMessageType() == null) {
            return;
        }

        // Idempotency check: Ignore duplicate messages
        if (!idempotentConsumerService.markProcessedIfNew(envelope.getMessageId(), "HotelCommandHandler")) {
            log.warn("HotelCommandHandler skipped duplicate command messageId={}", envelope.getMessageId());
            return;
        }

        log.info("Hotel Service received command: {}", envelope.getMessageType());

        switch (envelope.getMessageType()) {
            case "RESERVE_HOTEL_COMMAND" -> {
                ReserveHotelCommand cmd = messagingObjectMapper.convertValue(envelope.getPayload(), ReserveHotelCommand.class);
                handleReserveHotel(cmd, envelope.getCorrelationId(), envelope.getMessageId());
            }
            case "CONFIRM_HOTEL_COMMAND" -> {
                ConfirmHotelCommand cmd = messagingObjectMapper.convertValue(envelope.getPayload(), ConfirmHotelCommand.class);
                handleConfirmHotel(cmd);
            }
            case "RELEASE_HOTEL_COMMAND" -> {
                ReleaseHotelCommand cmd = messagingObjectMapper.convertValue(envelope.getPayload(), ReleaseHotelCommand.class);
                handleReleaseHotel(cmd);
            }
            default -> log.debug("Hotel Service ignored command: {}", envelope.getMessageType());
        }
    }

    private void handleReserveHotel(ReserveHotelCommand cmd, String correlationId, String causationId) {
        List<RoomInventory> inventories = roomInventoryRepository.findByRoomTypeIdAndInventoryDateBetween(
                cmd.getRoomTypeId(), cmd.getCheckInDate(), cmd.getCheckOutDate().minusDays(1)
        );

        if (inventories.isEmpty()) {
            publishReserveFailed(cmd, "No room inventory found for dates", correlationId, causationId);
            return;
        }

        boolean allAvailable = inventories.stream()
                .allMatch(inv -> inv.getAvailableRooms() >= cmd.getRoomQuantity());

        if (!allAvailable) {
            publishReserveFailed(cmd, "Not enough available rooms for all dates", correlationId, causationId);
            return;
        }

        BigDecimal totalPrice = BigDecimal.ZERO;
        for (RoomInventory inv : inventories) {
            inv.setAvailableRooms(inv.getAvailableRooms() - cmd.getRoomQuantity());
            roomInventoryRepository.save(inv);
            if (inv.getRoomType() != null && inv.getRoomType().getBasePrice() != null) {
                totalPrice = totalPrice.add(inv.getRoomType().getBasePrice().multiply(BigDecimal.valueOf(cmd.getRoomQuantity())));
            }
        }

        HotelReservedEvent event = HotelReservedEvent.builder()
                .bookingId(cmd.getBookingId())
                .bookingCode(cmd.getBookingCode())
                .hotelId(cmd.getHotelId())
                .roomTypeId(cmd.getRoomTypeId())
                .roomQuantity(cmd.getRoomQuantity())
                .price(totalPrice)
                .build();

        MessageEnvelope<HotelReservedEvent> evtEnvelope = MessageEnvelope.of(
                "HOTEL_RESERVED_EVENT", event, correlationId, causationId
        );

        outboxPublisher.enqueueAndPublish(
                "HotelReservation",
                cmd.getBookingId().toString(),
                "HOTEL_RESERVED_EVENT",
                RabbitMQConstants.EXCHANGE_EVENTS,
                RabbitMQConstants.ROUTING_KEY_HOTEL_RESERVED,
                evtEnvelope
        );
        log.info("Hotel rooms reserved successfully for booking {}. Emitted HotelReservedEvent via outbox.", cmd.getBookingCode());
    }

    private void handleConfirmHotel(ConfirmHotelCommand cmd) {
        log.info("Confirmed hotel reservation for booking {}", cmd.getBookingCode());
    }

    private void handleReleaseHotel(ReleaseHotelCommand cmd) {
        List<RoomInventory> inventories = roomInventoryRepository.findByRoomTypeIdAndInventoryDateBetween(
                cmd.getRoomTypeId(), cmd.getCheckInDate(), cmd.getCheckOutDate().minusDays(1)
        );
        for (RoomInventory inv : inventories) {
            inv.setAvailableRooms(inv.getAvailableRooms() + cmd.getRoomQuantity());
            roomInventoryRepository.save(inv);
        }
        log.info("Released hotel rooms for booking {}", cmd.getBookingCode());
    }

    private void publishReserveFailed(ReserveHotelCommand cmd, String reason, String correlationId, String causationId) {
        HotelReserveFailedEvent event = HotelReserveFailedEvent.builder()
                .bookingId(cmd.getBookingId())
                .bookingCode(cmd.getBookingCode())
                .hotelId(cmd.getHotelId())
                .roomTypeId(cmd.getRoomTypeId())
                .reason(reason)
                .build();

        MessageEnvelope<HotelReserveFailedEvent> evtEnvelope = MessageEnvelope.of(
                "HOTEL_RESERVE_FAILED_EVENT", event, correlationId, causationId
        );

        outboxPublisher.enqueueAndPublish(
                "HotelReservation",
                cmd.getBookingId().toString(),
                "HOTEL_RESERVE_FAILED_EVENT",
                RabbitMQConstants.EXCHANGE_EVENTS,
                RabbitMQConstants.ROUTING_KEY_HOTEL_RESERVE_FAILED,
                evtEnvelope
        );
        log.warn("Hotel reservation failed for booking {}: {}", cmd.getBookingCode(), reason);
    }
}

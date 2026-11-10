package com.smarttrip.hotel.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.smarttrip.hotel.entity.RoomInventory;
import com.smarttrip.hotel.entity.RoomType;
import com.smarttrip.hotel.idempotency.IdempotentConsumerService;
import com.smarttrip.hotel.outbox.OutboxPublisher;
import com.smarttrip.hotel.repository.RoomInventoryRepository;
import com.smarttrip.messaging.command.ConfirmHotelCommand;
import com.smarttrip.messaging.command.ReleaseHotelCommand;
import com.smarttrip.messaging.command.ReserveHotelCommand;
import com.smarttrip.messaging.constant.RabbitMQConstants;
import com.smarttrip.messaging.envelope.MessageEnvelope;
import com.smarttrip.messaging.event.HotelReservedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HotelCommandHandlerTest {

    @Mock
    private RoomInventoryRepository roomInventoryRepository;

    @Mock
    private IdempotentConsumerService idempotentConsumerService;

    @Mock
    private OutboxPublisher outboxPublisher;

    @Spy
    private ObjectMapper messagingObjectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @InjectMocks
    private HotelCommandHandler hotelCommandHandler;

    @Test
    @DisplayName("Should process ReserveHotelCommand and emit HotelReservedEvent via Outbox")
    void handleReserveHotel_success() {
        when(idempotentConsumerService.markProcessedIfNew("msg-hotel-1", "HotelCommandHandler")).thenReturn(true);

        RoomType roomType = RoomType.builder().id(20L).basePrice(new BigDecimal("1000000.00")).build();
        RoomInventory inv = RoomInventory.builder()
                .id(101L)
                .roomType(roomType)
                .availableRooms(5)
                .inventoryDate(LocalDate.now().plusDays(2))
                .build();

        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(3);

        when(roomInventoryRepository.findByRoomTypeIdAndInventoryDateBetween(20L, checkIn, checkIn))
                .thenReturn(List.of(inv));

        ReserveHotelCommand cmd = ReserveHotelCommand.builder()
                .bookingId(1L)
                .bookingCode("BK-HOTEL-1")
                .hotelId(10L)
                .roomTypeId(20L)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .roomQuantity(1)
                .build();

        MessageEnvelope<Object> envelope = MessageEnvelope.<Object>builder()
                .messageId("msg-hotel-1")
                .correlationId("saga-hotel-1")
                .messageType("RESERVE_HOTEL_COMMAND")
                .payload(cmd)
                .build();

        hotelCommandHandler.onHotelCommand(envelope);

        assertThat(inv.getAvailableRooms()).isEqualTo(4);
        verify(roomInventoryRepository, times(1)).save(inv);

        ArgumentCaptor<Object> captor = ArgumentCaptor.forClass(Object.class);
        verify(outboxPublisher, times(1)).enqueueAndPublish(
                eq("HotelReservation"),
                eq("1"),
                eq("HOTEL_RESERVED_EVENT"),
                eq(RabbitMQConstants.EXCHANGE_EVENTS),
                eq(RabbitMQConstants.ROUTING_KEY_HOTEL_RESERVED),
                captor.capture()
        );

        MessageEnvelope evtEnvelope = (MessageEnvelope) captor.getValue();
        HotelReservedEvent evt = (HotelReservedEvent) evtEnvelope.getPayload();
        assertThat(evt.getPrice()).isEqualByComparingTo("1000000.00");
    }

    @Test
    @DisplayName("Idempotency: Sending 10 duplicate ReserveHotelCommand only deducts room inventory ONCE")
    void handleReserveHotel_tenDuplicates_deductsOnlyOnce() {
        String duplicateMsgId = "msg-dup-hotel-999";
        Set<String> processedMsgIds = new HashSet<>();

        when(idempotentConsumerService.markProcessedIfNew(eq(duplicateMsgId), eq("HotelCommandHandler")))
                .thenAnswer(inv -> processedMsgIds.add(duplicateMsgId));

        RoomType roomType = RoomType.builder().id(20L).basePrice(new BigDecimal("1000000.00")).build();
        RoomInventory inv = RoomInventory.builder()
                .id(101L)
                .roomType(roomType)
                .availableRooms(5)
                .inventoryDate(LocalDate.now().plusDays(2))
                .build();

        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(3);

        when(roomInventoryRepository.findByRoomTypeIdAndInventoryDateBetween(20L, checkIn, checkIn))
                .thenReturn(List.of(inv));

        ReserveHotelCommand cmd = ReserveHotelCommand.builder()
                .bookingId(1L)
                .bookingCode("BK-HOTEL-DUP")
                .hotelId(10L)
                .roomTypeId(20L)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .roomQuantity(1)
                .build();

        MessageEnvelope<Object> envelope = MessageEnvelope.<Object>builder()
                .messageId(duplicateMsgId)
                .correlationId("saga-dup-h")
                .messageType("RESERVE_HOTEL_COMMAND")
                .payload(cmd)
                .build();

        for (int i = 0; i < 10; i++) {
            hotelCommandHandler.onHotelCommand(envelope);
        }

        // Room count decremented from 5 to 4 only ONCE, never to -5!
        assertThat(inv.getAvailableRooms()).isEqualTo(4);
        verify(roomInventoryRepository, times(1)).save(inv);
        verify(outboxPublisher, times(1)).enqueueAndPublish(any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Compensation: Should process ReleaseHotelCommand and restore room inventory")
    void handleReleaseHotel_success() {
        when(idempotentConsumerService.markProcessedIfNew("msg-release-hotel", "HotelCommandHandler")).thenReturn(true);

        RoomType roomType = RoomType.builder().id(20L).basePrice(new BigDecimal("1000000.00")).build();
        RoomInventory inv = RoomInventory.builder()
                .id(101L)
                .roomType(roomType)
                .availableRooms(3)
                .inventoryDate(LocalDate.now().plusDays(2))
                .build();

        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(3);

        when(roomInventoryRepository.findByRoomTypeIdAndInventoryDateBetween(20L, checkIn, checkIn))
                .thenReturn(List.of(inv));

        ReleaseHotelCommand cmd = ReleaseHotelCommand.builder()
                .bookingId(1L)
                .bookingCode("BK-HOTEL-1")
                .hotelId(10L)
                .roomTypeId(20L)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .roomQuantity(2)
                .build();

        MessageEnvelope<Object> envelope = MessageEnvelope.<Object>builder()
                .messageId("msg-release-hotel")
                .messageType("RELEASE_HOTEL_COMMAND")
                .payload(cmd)
                .build();

        hotelCommandHandler.onHotelCommand(envelope);

        // Room count restored from 3 to 5 (3 + 2 = 5)
        assertThat(inv.getAvailableRooms()).isEqualTo(5);
        verify(roomInventoryRepository, times(1)).save(inv);
    }

    @Test
    @DisplayName("Cancellation: Should process CANCEL_HOTEL_RESERVATION_COMMAND and restore room inventory")
    void handleCancelHotelReservation_success() {
        when(idempotentConsumerService.markProcessedIfNew("msg-cancel-hotel", "HotelCommandHandler")).thenReturn(true);

        RoomType roomType = RoomType.builder().id(20L).basePrice(new BigDecimal("1000000.00")).build();
        RoomInventory inv = RoomInventory.builder()
                .id(101L)
                .roomType(roomType)
                .availableRooms(2)
                .inventoryDate(LocalDate.now().plusDays(5))
                .build();

        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(7);

        when(roomInventoryRepository.findByRoomTypeIdAndInventoryDateBetween(20L, checkIn, checkOut.minusDays(1)))
                .thenReturn(List.of(inv));

        ReleaseHotelCommand cmd = ReleaseHotelCommand.builder()
                .bookingId(1L)
                .bookingCode("BK-HOTEL-CANCEL")
                .hotelId(10L)
                .roomTypeId(20L)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .roomQuantity(3)
                .build();

        MessageEnvelope<Object> envelope = MessageEnvelope.<Object>builder()
                .messageId("msg-cancel-hotel")
                .messageType("CANCEL_HOTEL_RESERVATION_COMMAND")
                .payload(cmd)
                .build();

        hotelCommandHandler.onHotelCommand(envelope);

        // Room count restored from 2 to 5 (2 + 3 = 5)
        assertThat(inv.getAvailableRooms()).isEqualTo(5);
        verify(roomInventoryRepository, times(1)).save(inv);
    }
}

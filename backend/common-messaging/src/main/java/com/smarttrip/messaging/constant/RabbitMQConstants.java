package com.smarttrip.messaging.constant;

public final class RabbitMQConstants {

    private RabbitMQConstants() {}

    // Exchanges
    public static final String EXCHANGE_COMMANDS = "smarttrip.commands";
    public static final String EXCHANGE_EVENTS = "smarttrip.events";
    public static final String EXCHANGE_DLX = "smarttrip.dlx";

    // Queues - Commands
    public static final String QUEUE_TOUR_COMMANDS = "smarttrip.tour.commands";
    public static final String QUEUE_HOTEL_COMMANDS = "smarttrip.hotel.commands";
    public static final String QUEUE_PAYMENT_COMMANDS = "smarttrip.payment.commands";
    public static final String QUEUE_BOOKING_COMMANDS = "smarttrip.booking.commands";

    // Queues - Events
    public static final String QUEUE_BOOKING_EVENTS = "smarttrip.booking.events";
    public static final String QUEUE_TOUR_EVENTS = "smarttrip.tour.events";
    public static final String QUEUE_HOTEL_EVENTS = "smarttrip.hotel.events";
    public static final String QUEUE_PAYMENT_EVENTS = "smarttrip.payment.events";

    // Dead Letter Queue
    public static final String QUEUE_DEAD_LETTER = "smarttrip.dlq";

    // Routing Keys - Tour
    public static final String ROUTING_KEY_RESERVE_TOUR = "command.tour.reserve";
    public static final String ROUTING_KEY_CONFIRM_TOUR = "command.tour.confirm";
    public static final String ROUTING_KEY_RELEASE_TOUR = "command.tour.release";
    public static final String ROUTING_KEY_TOUR_COMMAND_PATTERN = "command.tour.*";

    public static final String ROUTING_KEY_TOUR_RESERVED = "event.tour.reserved";
    public static final String ROUTING_KEY_TOUR_RESERVE_FAILED = "event.tour.reserve-failed";
    public static final String ROUTING_KEY_TOUR_EVENT_PATTERN = "event.tour.*";

    // Routing Keys - Hotel
    public static final String ROUTING_KEY_RESERVE_HOTEL = "command.hotel.reserve";
    public static final String ROUTING_KEY_CONFIRM_HOTEL = "command.hotel.confirm";
    public static final String ROUTING_KEY_RELEASE_HOTEL = "command.hotel.release";
    public static final String ROUTING_KEY_HOTEL_COMMAND_PATTERN = "command.hotel.*";

    public static final String ROUTING_KEY_HOTEL_RESERVED = "event.hotel.reserved";
    public static final String ROUTING_KEY_HOTEL_RESERVE_FAILED = "event.hotel.reserve-failed";
    public static final String ROUTING_KEY_HOTEL_EVENT_PATTERN = "event.hotel.*";

    // Routing Keys - Payment
    public static final String ROUTING_KEY_AUTHORIZE_PAYMENT = "command.payment.authorize";
    public static final String ROUTING_KEY_CAPTURE_PAYMENT = "command.payment.capture";
    public static final String ROUTING_KEY_VOID_PAYMENT = "command.payment.void";
    public static final String ROUTING_KEY_PAYMENT_COMMAND_PATTERN = "command.payment.*";

    public static final String ROUTING_KEY_PAYMENT_AUTHORIZED = "event.payment.authorized";
    public static final String ROUTING_KEY_PAYMENT_AUTHORIZE_FAILED = "event.payment.authorize-failed";
    public static final String ROUTING_KEY_PAYMENT_EVENT_PATTERN = "event.payment.*";

    // Routing Keys - Wildcards
    public static final String ROUTING_KEY_ALL_EVENTS = "event.#";
    public static final String ROUTING_KEY_DLQ = "#";
}

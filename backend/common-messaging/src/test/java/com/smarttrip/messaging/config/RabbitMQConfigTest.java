package com.smarttrip.messaging.config;

import com.smarttrip.messaging.constant.RabbitMQConstants;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;

import static org.assertj.core.api.Assertions.assertThat;

class RabbitMQConfigTest {

    private final RabbitMQConfig rabbitMQConfig = new RabbitMQConfig();

    @Test
    @DisplayName("Should configure exchanges with durable flag")
    void testExchanges() {
        TopicExchange commandsExchange = rabbitMQConfig.commandsExchange();
        assertThat(commandsExchange.getName()).isEqualTo(RabbitMQConstants.EXCHANGE_COMMANDS);
        assertThat(commandsExchange.isDurable()).isTrue();

        TopicExchange eventsExchange = rabbitMQConfig.eventsExchange();
        assertThat(eventsExchange.getName()).isEqualTo(RabbitMQConstants.EXCHANGE_EVENTS);
        assertThat(eventsExchange.isDurable()).isTrue();

        TopicExchange dlxExchange = rabbitMQConfig.deadLetterExchange();
        assertThat(dlxExchange.getName()).isEqualTo(RabbitMQConstants.EXCHANGE_DLX);
        assertThat(dlxExchange.isDurable()).isTrue();
    }

    @Test
    @DisplayName("Should configure queues with dead letter arguments routing to smarttrip.dlx")
    void testQueuesDeadLetterConfiguration() {
        Queue tourQueue = rabbitMQConfig.tourCommandsQueue();
        assertThat(tourQueue.getName()).isEqualTo(RabbitMQConstants.QUEUE_TOUR_COMMANDS);
        assertThat(tourQueue.getArguments()).containsEntry("x-dead-letter-exchange", RabbitMQConstants.EXCHANGE_DLX);

        Queue hotelQueue = rabbitMQConfig.hotelCommandsQueue();
        assertThat(hotelQueue.getName()).isEqualTo(RabbitMQConstants.QUEUE_HOTEL_COMMANDS);
        assertThat(hotelQueue.getArguments()).containsEntry("x-dead-letter-exchange", RabbitMQConstants.EXCHANGE_DLX);

        Queue paymentQueue = rabbitMQConfig.paymentCommandsQueue();
        assertThat(paymentQueue.getName()).isEqualTo(RabbitMQConstants.QUEUE_PAYMENT_COMMANDS);
        assertThat(paymentQueue.getArguments()).containsEntry("x-dead-letter-exchange", RabbitMQConstants.EXCHANGE_DLX);

        Queue bookingEventsQueue = rabbitMQConfig.bookingEventsQueue();
        assertThat(bookingEventsQueue.getName()).isEqualTo(RabbitMQConstants.QUEUE_BOOKING_EVENTS);
        assertThat(bookingEventsQueue.getArguments()).containsEntry("x-dead-letter-exchange", RabbitMQConstants.EXCHANGE_DLX);

        Queue dlq = rabbitMQConfig.deadLetterQueue();
        assertThat(dlq.getName()).isEqualTo(RabbitMQConstants.QUEUE_DEAD_LETTER);
        assertThat(dlq.isDurable()).isTrue();
    }

    @Test
    @DisplayName("Should configure bindings with correct routing keys")
    void testBindings() {
        Queue tourQueue = rabbitMQConfig.tourCommandsQueue();
        TopicExchange commandsExchange = rabbitMQConfig.commandsExchange();
        Binding tourBinding = rabbitMQConfig.tourCommandsBinding(tourQueue, commandsExchange);
        assertThat(tourBinding.getRoutingKey()).isEqualTo(RabbitMQConstants.ROUTING_KEY_TOUR_COMMAND_PATTERN);

        Queue bookingEventsQueue = rabbitMQConfig.bookingEventsQueue();
        TopicExchange eventsExchange = rabbitMQConfig.eventsExchange();
        Binding bookingEventsBinding = rabbitMQConfig.bookingEventsBinding(bookingEventsQueue, eventsExchange);
        assertThat(bookingEventsBinding.getRoutingKey()).isEqualTo(RabbitMQConstants.ROUTING_KEY_ALL_EVENTS);

        Queue dlq = rabbitMQConfig.deadLetterQueue();
        TopicExchange dlx = rabbitMQConfig.deadLetterExchange();
        Binding dlqBinding = rabbitMQConfig.deadLetterBinding(dlq, dlx);
        assertThat(dlqBinding.getRoutingKey()).isEqualTo(RabbitMQConstants.ROUTING_KEY_DLQ);
    }
}

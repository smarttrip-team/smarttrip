package com.smarttrip.messaging.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.smarttrip.messaging.constant.RabbitMQConstants;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.retry.RejectAndDontRequeueRecoverer;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class RabbitMQConfig {

    @Bean
    @ConditionalOnMissingBean
    public ObjectMapper messagingObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }

    @Bean
    @ConditionalOnMissingBean
    public MessageConverter jacksonMessageConverter(ObjectMapper messagingObjectMapper) {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter(messagingObjectMapper);
        converter.setAlwaysConvertToInferredType(true);
        return converter;
    }

    @Bean
    @ConditionalOnMissingBean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jacksonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jacksonMessageConverter);
        return template;
    }

    // ==========================================
    // Exchanges
    // ==========================================

    @Bean
    public TopicExchange commandsExchange() {
        return new TopicExchange(RabbitMQConstants.EXCHANGE_COMMANDS, true, false);
    }

    @Bean
    public TopicExchange eventsExchange() {
        return new TopicExchange(RabbitMQConstants.EXCHANGE_EVENTS, true, false);
    }

    @Bean
    public TopicExchange deadLetterExchange() {
        return new TopicExchange(RabbitMQConstants.EXCHANGE_DLX, true, false);
    }

    // ==========================================
    // Dead Letter Queue
    // ==========================================

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(RabbitMQConstants.QUEUE_DEAD_LETTER).build();
    }

    @Bean
    public Binding deadLetterBinding(Queue deadLetterQueue, TopicExchange deadLetterExchange) {
        return BindingBuilder.bind(deadLetterQueue).to(deadLetterExchange).with(RabbitMQConstants.ROUTING_KEY_DLQ);
    }

    // ==========================================
    // Command Queues with DLQ Config
    // ==========================================

    private Map<String, Object> dlqArguments(String routingKey) {
        Map<String, Object> args = new HashMap<>();
        args.put("x-dead-letter-exchange", RabbitMQConstants.EXCHANGE_DLX);
        args.put("x-dead-letter-routing-key", routingKey);
        return args;
    }

    @Bean
    public Queue tourCommandsQueue() {
        return QueueBuilder.durable(RabbitMQConstants.QUEUE_TOUR_COMMANDS)
                .withArguments(dlqArguments("dlq.tour.commands"))
                .build();
    }

    @Bean
    public Binding tourCommandsBinding(Queue tourCommandsQueue, TopicExchange commandsExchange) {
        return BindingBuilder.bind(tourCommandsQueue).to(commandsExchange)
                .with(RabbitMQConstants.ROUTING_KEY_TOUR_COMMAND_PATTERN);
    }

    @Bean
    public Queue hotelCommandsQueue() {
        return QueueBuilder.durable(RabbitMQConstants.QUEUE_HOTEL_COMMANDS)
                .withArguments(dlqArguments("dlq.hotel.commands"))
                .build();
    }

    @Bean
    public Binding hotelCommandsBinding(Queue hotelCommandsQueue, TopicExchange commandsExchange) {
        return BindingBuilder.bind(hotelCommandsQueue).to(commandsExchange)
                .with(RabbitMQConstants.ROUTING_KEY_HOTEL_COMMAND_PATTERN);
    }

    @Bean
    public Queue paymentCommandsQueue() {
        return QueueBuilder.durable(RabbitMQConstants.QUEUE_PAYMENT_COMMANDS)
                .withArguments(dlqArguments("dlq.payment.commands"))
                .build();
    }

    @Bean
    public Binding paymentCommandsBinding(Queue paymentCommandsQueue, TopicExchange commandsExchange) {
        return BindingBuilder.bind(paymentCommandsQueue).to(commandsExchange)
                .with(RabbitMQConstants.ROUTING_KEY_PAYMENT_COMMAND_PATTERN);
    }

    @Bean
    public Queue bookingCommandsQueue() {
        return QueueBuilder.durable(RabbitMQConstants.QUEUE_BOOKING_COMMANDS)
                .withArguments(dlqArguments("dlq.booking.commands"))
                .build();
    }

    @Bean
    public Binding bookingCommandsBinding(Queue bookingCommandsQueue, TopicExchange commandsExchange) {
        return BindingBuilder.bind(bookingCommandsQueue).to(commandsExchange)
                .with("command.booking.*");
    }

    // ==========================================
    // Event Queues with DLQ Config
    // ==========================================

    @Bean
    public Queue bookingEventsQueue() {
        return QueueBuilder.durable(RabbitMQConstants.QUEUE_BOOKING_EVENTS)
                .withArguments(dlqArguments("dlq.booking.events"))
                .build();
    }

    @Bean
    public Binding bookingEventsBinding(Queue bookingEventsQueue, TopicExchange eventsExchange) {
        return BindingBuilder.bind(bookingEventsQueue).to(eventsExchange)
                .with(RabbitMQConstants.ROUTING_KEY_ALL_EVENTS);
    }

    @Bean
    public Queue tourEventsQueue() {
        return QueueBuilder.durable(RabbitMQConstants.QUEUE_TOUR_EVENTS)
                .withArguments(dlqArguments("dlq.tour.events"))
                .build();
    }

    @Bean
    public Binding tourEventsBinding(Queue tourEventsQueue, TopicExchange eventsExchange) {
        return BindingBuilder.bind(tourEventsQueue).to(eventsExchange)
                .with(RabbitMQConstants.ROUTING_KEY_TOUR_EVENT_PATTERN);
    }

    @Bean
    public Queue hotelEventsQueue() {
        return QueueBuilder.durable(RabbitMQConstants.QUEUE_HOTEL_EVENTS)
                .withArguments(dlqArguments("dlq.hotel.events"))
                .build();
    }

    @Bean
    public Binding hotelEventsBinding(Queue hotelEventsQueue, TopicExchange eventsExchange) {
        return BindingBuilder.bind(hotelEventsQueue).to(eventsExchange)
                .with(RabbitMQConstants.ROUTING_KEY_HOTEL_EVENT_PATTERN);
    }

    @Bean
    public Queue paymentEventsQueue() {
        return QueueBuilder.durable(RabbitMQConstants.QUEUE_PAYMENT_EVENTS)
                .withArguments(dlqArguments("dlq.payment.events"))
                .build();
    }

    @Bean
    public Binding paymentEventsBinding(Queue paymentEventsQueue, TopicExchange eventsExchange) {
        return BindingBuilder.bind(paymentEventsQueue).to(eventsExchange)
                .with(RabbitMQConstants.ROUTING_KEY_PAYMENT_EVENT_PATTERN);
    }

    // ==========================================
    // Listener Factory with Retry & DLQ Routing
    // ==========================================

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            MessageConverter jacksonMessageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jacksonMessageConverter);

        // Configure 3 retry attempts with exponential backoff before sending to DLQ via reject
        var advice = RetryInterceptorBuilder.stateless()
                .maxAttempts(3)
                .backOffOptions(1000, 2.0, 5000)
                .recoverer(new RejectAndDontRequeueRecoverer())
                .build();
        factory.setAdviceChain(advice);

        return factory;
    }
}

package com.smarttrip.messaging.envelope;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageEnvelope<T> {

    @Builder.Default
    private String messageId = UUID.randomUUID().toString();

    private String correlationId;

    private String causationId;

    private String messageType;

    @Builder.Default
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime occurredAt = LocalDateTime.now();

    private T payload;

    public static <T> MessageEnvelope<T> of(String messageType, T payload, String correlationId, String causationId) {
        return MessageEnvelope.<T>builder()
                .messageId(UUID.randomUUID().toString())
                .messageType(messageType)
                .payload(payload)
                .correlationId(correlationId)
                .causationId(causationId)
                .occurredAt(LocalDateTime.now())
                .build();
    }

    public static <T> MessageEnvelope<T> of(String messageType, T payload, String correlationId) {
        return of(messageType, payload, correlationId, null);
    }
}

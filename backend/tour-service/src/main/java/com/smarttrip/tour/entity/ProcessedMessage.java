package com.smarttrip.tour.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "processed_messages")
@IdClass(ProcessedMessageId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessedMessage {

    @Id
    @Column(name = "message_id", length = 100, nullable = false)
    private String messageId;

    @Id
    @Column(name = "consumer_name", length = 100, nullable = false)
    private String consumerName;

    @Builder.Default
    @Column(name = "processed_at", nullable = false)
    private LocalDateTime processedAt = LocalDateTime.now();
}

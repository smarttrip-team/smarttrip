package com.smarttrip.booking.entity;

import lombok.*;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcessedMessageId implements Serializable {
    private String messageId;
    private String consumerName;
}

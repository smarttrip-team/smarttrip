package com.smarttrip.hotel.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcessedMessageId implements Serializable {
    private String messageId;
    private String consumerName;
}

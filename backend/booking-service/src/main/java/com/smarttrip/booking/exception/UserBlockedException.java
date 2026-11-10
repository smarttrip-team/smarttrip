package com.smarttrip.booking.exception;

public class UserBlockedException extends RuntimeException {
    public UserBlockedException(String message) {
        super(message);
    }

    public UserBlockedException(Long userId, String status) {
        super(String.format("User account is %s", status));
    }
}

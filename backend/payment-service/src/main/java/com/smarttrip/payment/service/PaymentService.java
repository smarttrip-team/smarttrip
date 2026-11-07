package com.smarttrip.payment.service;

import com.smarttrip.payment.dto.PaymentResponse;
import com.smarttrip.payment.dto.WalletResponse;

public interface PaymentService {
    WalletResponse getWalletByUserId(Long userId);
    PaymentResponse getPaymentByBookingId(String bookingId);
}

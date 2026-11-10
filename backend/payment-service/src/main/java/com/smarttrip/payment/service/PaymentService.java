package com.smarttrip.payment.service;

import com.smarttrip.payment.dto.PaymentResponse;
import com.smarttrip.payment.dto.TopUpRequest;
import com.smarttrip.payment.dto.TransactionResponse;
import com.smarttrip.payment.dto.WalletResponse;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentService {

    WalletResponse getWalletByUserId(Long userId);

    WalletResponse topUp(TopUpRequest request);

    List<TransactionResponse> getTransactionsByUserId(Long userId);

    PaymentResponse getPaymentByBookingId(String bookingId);

    PaymentResponse authorize(Long userId, String bookingId, BigDecimal amount);

    PaymentResponse capture(Long userId, String bookingId, BigDecimal amount);

    void voidAuthorization(Long userId, String bookingId);

    PaymentResponse refund(Long userId, String bookingId, BigDecimal amount, String reason);
}

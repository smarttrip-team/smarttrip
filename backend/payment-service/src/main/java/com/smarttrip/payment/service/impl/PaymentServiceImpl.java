package com.smarttrip.payment.service.impl;

import com.smarttrip.payment.dto.PaymentResponse;
import com.smarttrip.payment.dto.WalletResponse;
import com.smarttrip.payment.entity.Payment;
import com.smarttrip.payment.entity.Wallet;
import com.smarttrip.payment.repository.PaymentRepository;
import com.smarttrip.payment.repository.WalletRepository;
import com.smarttrip.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final WalletRepository walletRepository;
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional(readOnly = true)
    public WalletResponse getWalletByUserId(Long userId) {
        return walletRepository.findByUserId(userId)
                .map(this::mapWalletToResponse)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByBookingId(String bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .map(this::mapPaymentToResponse)
                .orElse(null);
    }

    private WalletResponse mapWalletToResponse(Wallet wallet) {
        return WalletResponse.builder()
                .id(wallet.getId())
                .userId(wallet.getUserId())
                .balance(wallet.getBalance())
                .currency(wallet.getCurrency())
                .status(wallet.getStatus())
                .build();
    }

    private PaymentResponse mapPaymentToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBookingId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .build();
    }
}

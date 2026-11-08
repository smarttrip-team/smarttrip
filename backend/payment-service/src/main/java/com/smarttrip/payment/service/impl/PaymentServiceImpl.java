package com.smarttrip.payment.service.impl;

import com.smarttrip.payment.dto.PaymentResponse;
import com.smarttrip.payment.dto.TopUpRequest;
import com.smarttrip.payment.dto.TransactionResponse;
import com.smarttrip.payment.dto.WalletResponse;
import com.smarttrip.payment.entity.*;
import com.smarttrip.payment.exception.BusinessException;
import com.smarttrip.payment.exception.ResourceNotFoundException;
import com.smarttrip.payment.repository.*;
import com.smarttrip.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentAuthorizationRepository paymentAuthorizationRepository;
    private final RefundRepository refundRepository;

    @Override
    @Transactional
    public WalletResponse getWalletByUserId(Long userId) {
        if (userId == null) {
            throw new BusinessException("User ID is required");
        }
        Wallet wallet = getOrCreateWallet(userId);
        return mapWalletToResponse(wallet);
    }

    @Override
    @Transactional
    public WalletResponse topUp(TopUpRequest request) {
        if (request.getUserId() == null) {
            throw new BusinessException("User ID is required");
        }
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Top-up amount must be greater than zero");
        }

        // Idempotency check
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            var existingTx = walletTransactionRepository.findByIdempotencyKey(request.getIdempotencyKey());
            if (existingTx.isPresent()) {
                log.info("Duplicate top-up request with idempotency key: {}", request.getIdempotencyKey());
                return mapWalletToResponse(existingTx.get().getWallet());
            }
        }

        Wallet wallet = getOrCreateWallet(request.getUserId());
        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        Wallet savedWallet = walletRepository.save(wallet);

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(savedWallet)
                .transactionType("TOP_UP")
                .amount(request.getAmount())
                .referenceType("TOP_UP")
                .referenceId("TOP_UP-" + System.currentTimeMillis())
                .idempotencyKey(request.getIdempotencyKey())
                .build();
        walletTransactionRepository.save(tx);

        log.info("Top-up successful for user {}: +{} VND. New balance: {}",
                wallet.getUserId(), request.getAmount(), savedWallet.getBalance());

        return mapWalletToResponse(savedWallet);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByUserId(Long userId) {
        if (userId == null) {
            throw new BusinessException("User ID is required");
        }
        return walletRepository.findByUserId(userId)
                .map(wallet -> walletTransactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId())
                        .stream()
                        .map(this::mapTransactionToResponse)
                        .collect(Collectors.toList()))
                .orElse(Collections.emptyList());
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByBookingId(String bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .map(this::mapPaymentToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking: " + bookingId));
    }

    @Override
    @Transactional
    public PaymentResponse authorize(Long userId, String bookingId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Authorization amount must be greater than zero");
        }
        Wallet wallet = getOrCreateWallet(userId);

        if (wallet.getAvailableBalance().compareTo(amount) < 0) {
            throw new BusinessException(String.format(
                    "Insufficient wallet balance. Available: %s, Required: %s",
                    wallet.getAvailableBalance(), amount
            ));
        }

        wallet.setHeldAmount(wallet.getHeldAmount().add(amount));
        walletRepository.save(wallet);

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .transactionType("AUTHORIZE")
                .amount(amount)
                .referenceType("BOOKING")
                .referenceId(bookingId)
                .build();
        walletTransactionRepository.save(tx);

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseGet(() -> Payment.builder()
                        .bookingId(bookingId)
                        .userId(userId)
                        .amount(amount)
                        .currency(wallet.getCurrency())
                        .build());
        payment.setStatus("AUTHORIZED");
        payment.setAmount(amount);
        Payment savedPayment = paymentRepository.save(payment);

        PaymentAuthorization auth = PaymentAuthorization.builder()
                .payment(savedPayment)
                .authorizedAmount(amount)
                .status("AUTHORIZED")
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();
        paymentAuthorizationRepository.save(auth);

        log.info("Authorized payment for booking {}: amount={}, heldAmount={}",
                bookingId, amount, wallet.getHeldAmount());

        return mapPaymentToResponse(savedPayment);
    }

    @Override
    @Transactional
    public PaymentResponse capture(Long userId, String bookingId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Capture amount must be greater than zero");
        }
        Wallet wallet = getOrCreateWallet(userId);
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking: " + bookingId));

        if (wallet.getHeldAmount().compareTo(amount) < 0) {
            throw new BusinessException("Cannot capture: held amount is less than capture amount");
        }
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new BusinessException("Cannot capture: balance is less than capture amount");
        }

        wallet.setHeldAmount(wallet.getHeldAmount().subtract(amount));
        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .transactionType("CAPTURE")
                .amount(amount)
                .referenceType("BOOKING")
                .referenceId(bookingId)
                .build();
        walletTransactionRepository.save(tx);

        payment.setStatus("COMPLETED");
        Payment savedPayment = paymentRepository.save(payment);

        paymentAuthorizationRepository.findTopByPaymentIdOrderByCreatedAtDesc(savedPayment.getId())
                .ifPresent(auth -> {
                    auth.setStatus("CAPTURED");
                    paymentAuthorizationRepository.save(auth);
                });

        log.info("Captured payment for booking {}: amount={}, remaining balance={}",
                bookingId, amount, wallet.getBalance());

        return mapPaymentToResponse(savedPayment);
    }

    @Override
    @Transactional
    public void voidAuthorization(Long userId, String bookingId) {
        Wallet wallet = getOrCreateWallet(userId);
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking: " + bookingId));

        PaymentAuthorization auth = paymentAuthorizationRepository.findTopByPaymentIdOrderByCreatedAtDesc(payment.getId())
                .orElseThrow(() -> new BusinessException("No active authorization found for booking: " + bookingId));

        BigDecimal amount = auth.getAuthorizedAmount();
        wallet.setHeldAmount(wallet.getHeldAmount().subtract(amount));
        if (wallet.getHeldAmount().compareTo(BigDecimal.ZERO) < 0) {
            wallet.setHeldAmount(BigDecimal.ZERO);
        }
        walletRepository.save(wallet);

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .transactionType("VOID")
                .amount(amount)
                .referenceType("BOOKING")
                .referenceId(bookingId)
                .build();
        walletTransactionRepository.save(tx);

        auth.setStatus("VOIDED");
        paymentAuthorizationRepository.save(auth);

        payment.setStatus("VOIDED");
        paymentRepository.save(payment);

        log.info("Voided authorization for booking {}: released amount={}", bookingId, amount);
    }

    @Override
    @Transactional
    public PaymentResponse refund(Long userId, String bookingId, BigDecimal amount, String reason) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Refund amount must be greater than zero");
        }
        Wallet wallet = getOrCreateWallet(userId);
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking: " + bookingId));

        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .transactionType("REFUND")
                .amount(amount)
                .referenceType("BOOKING")
                .referenceId(bookingId)
                .build();
        walletTransactionRepository.save(tx);

        Refund refund = Refund.builder()
                .payment(payment)
                .refundAmount(amount)
                .status("COMPLETED")
                .reason(reason != null ? reason : "Requested by customer")
                .build();
        refundRepository.save(refund);

        payment.setStatus("REFUNDED");
        Payment savedPayment = paymentRepository.save(payment);

        log.info("Refunded payment for booking {}: +{} VND to user {}", bookingId, amount, userId);

        return mapPaymentToResponse(savedPayment);
    }

    private Wallet getOrCreateWallet(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Wallet newWallet = Wallet.builder()
                            .userId(userId)
                            .balance(BigDecimal.ZERO)
                            .heldAmount(BigDecimal.ZERO)
                            .currency("VND")
                            .status("ACTIVE")
                            .version(0L)
                            .build();
                    return walletRepository.save(newWallet);
                });
    }

    private WalletResponse mapWalletToResponse(Wallet wallet) {
        return WalletResponse.builder()
                .id(wallet.getId())
                .userId(wallet.getUserId())
                .balance(wallet.getBalance())
                .heldAmount(wallet.getHeldAmount())
                .availableBalance(wallet.getAvailableBalance())
                .currency(wallet.getCurrency())
                .status(wallet.getStatus())
                .build();
    }

    private TransactionResponse mapTransactionToResponse(WalletTransaction tx) {
        return TransactionResponse.builder()
                .id(tx.getId())
                .walletId(tx.getWallet() != null ? tx.getWallet().getId() : null)
                .transactionType(tx.getTransactionType())
                .amount(tx.getAmount())
                .referenceType(tx.getReferenceType())
                .referenceId(tx.getReferenceId())
                .idempotencyKey(tx.getIdempotencyKey())
                .createdAt(tx.getCreatedAt())
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

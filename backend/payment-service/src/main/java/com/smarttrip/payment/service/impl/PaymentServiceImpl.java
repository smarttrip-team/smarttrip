package com.smarttrip.payment.service.impl;

import com.smarttrip.payment.dto.PaymentResponse;
import com.smarttrip.payment.dto.TopUpRequest;
import com.smarttrip.payment.dto.TransactionResponse;
import com.smarttrip.payment.dto.WalletResponse;
import com.smarttrip.payment.dto.WithdrawRequest;
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
import java.math.RoundingMode;
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
            throw new BusinessException("Top up amount must be greater than zero");
        }

        // Idempotency check
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            var existingTx = walletTransactionRepository.findByIdempotencyKey(request.getIdempotencyKey());
            if (existingTx.isPresent()) {
                log.info("Duplicate top-up request with key: {}", request.getIdempotencyKey());
                Wallet wallet = existingTx.get().getWallet();
                return mapWalletToResponse(wallet);
            }
        }

        Wallet wallet = getOrCreateWallet(request.getUserId());
        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        Wallet savedWallet = walletRepository.save(wallet);

        String refId = "TOP_UP-" + System.currentTimeMillis();
        WalletTransaction tx = WalletTransaction.builder()
                .wallet(savedWallet)
                .transactionType("TOP_UP")
                .amount(request.getAmount())
                .referenceType("TOP_UP")
                .referenceId(refId)
                .idempotencyKey(request.getIdempotencyKey())
                .build();
        walletTransactionRepository.save(tx);

        log.info("Top-up successful for user {}: +{} VND, new balance: {}",
                request.getUserId(), request.getAmount(), savedWallet.getBalance());

        return mapWalletToResponse(savedWallet);
    }

    @Override
    @Transactional
    public WalletResponse withdraw(WithdrawRequest request) {
        if (request.getUserId() == null) {
            throw new BusinessException("User ID is required");
        }
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Withdraw amount must be greater than zero");
        }

        String rawKey = (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank())
                ? request.getIdempotencyKey().trim()
                : null;

        // Idempotency check
        if (rawKey != null) {
            var existingTx = walletTransactionRepository.findByIdempotencyKey(rawKey);
            if (existingTx.isPresent()) {
                log.info("Duplicate withdraw request with key: {}", rawKey);
                Wallet wallet = existingTx.get().getWallet();
                return mapWalletToResponse(wallet);
            }
        }

        Wallet wallet = getOrCreateWallet(request.getUserId());
        if (wallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BusinessException("Số dư khả dụng không đủ để thực hiện rút tiền");
        }

        wallet.setBalance(wallet.getBalance().subtract(request.getAmount()));
        Wallet savedWallet = walletRepository.save(wallet);

        String bank = (request.getBankName() != null && !request.getBankName().isBlank())
                ? request.getBankName().trim()
                : "BANK";
        String acc = (request.getAccountNumber() != null && !request.getAccountNumber().isBlank())
                ? request.getAccountNumber().trim()
                : ("WD-" + System.currentTimeMillis());

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(savedWallet)
                .transactionType("WITHDRAW")
                .amount(request.getAmount())
                .referenceType(bank)
                .referenceId(acc)
                .idempotencyKey(rawKey)
                .build();
        walletTransactionRepository.save(tx);

        log.info("Withdraw successful for user {}: -{} VND to {} ({}), new balance: {}",
                request.getUserId(), request.getAmount(), acc, bank, savedWallet.getBalance());

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
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking: " + bookingId));
        return mapPaymentToResponse(payment);
    }

    @Override
    @Transactional
    public PaymentResponse authorize(Long userId, String bookingId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Authorization amount must be greater than zero");
        }
        Wallet wallet = getOrCreateWallet(userId);

        BigDecimal available = wallet.getAvailableBalance();
        if (available.compareTo(amount) < 0) {
            throw new BusinessException(String.format(
                    "Insufficient available balance: available %s, required %s", available, amount));
        }

        wallet.setHeldAmount(wallet.getHeldAmount().add(amount));
        walletRepository.save(wallet);

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseGet(() -> paymentRepository.save(Payment.builder()
                        .bookingId(bookingId)
                        .amount(amount)
                        .currency("VND")
                        .status("PENDING")
                        .build()));

        PaymentAuthorization auth = PaymentAuthorization.builder()
                .payment(payment)
                .authorizedAmount(amount)
                .status("AUTHORIZED")
                .expiresAt(LocalDateTime.now().plusHours(2))
                .build();
        paymentAuthorizationRepository.save(auth);

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .transactionType("AUTHORIZE")
                .amount(amount)
                .referenceType("BOOKING")
                .referenceId(bookingId)
                .idempotencyKey("AUTH-" + bookingId + "-" + System.currentTimeMillis())
                .build();
        walletTransactionRepository.save(tx);

        log.info("Authorized payment for booking {}: amount={}, user={}, held={}",
                bookingId, amount, userId, wallet.getHeldAmount());

        return mapPaymentToResponse(payment);
    }

    @Override
    @Transactional
    public PaymentResponse capture(Long userId, String bookingId, BigDecimal amount) {
        return capture(userId, bookingId, amount, 2L, amount, 3L, BigDecimal.ZERO);
    }

    @Override
    @Transactional
    public PaymentResponse capture(Long userId, String bookingId, BigDecimal amount, Long operatorId, BigDecimal tourAmount, Long hotelierId, BigDecimal hotelAmount) {
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
                .idempotencyKey("CAPTURE-" + bookingId + "-" + System.currentTimeMillis())
                .build();
        walletTransactionRepository.save(tx);

        payment.setStatus("COMPLETED");
        Payment savedPayment = paymentRepository.save(payment);

        paymentAuthorizationRepository.findTopByPaymentIdOrderByCreatedAtDesc(savedPayment.getId())
                .ifPresent(auth -> {
                    auth.setStatus("CAPTURED");
                    paymentAuthorizationRepository.save(auth);
                });

        // Money is safely held in Platform Escrow pending tour completion.
        // Partner settlement (90/10) will be triggered when the trip is marked COMPLETED.
        log.info("Captured customer payment into Platform Escrow for booking {}: amount={}, remaining customer balance={}",
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
                .idempotencyKey("VOID-" + bookingId + "-" + System.currentTimeMillis())
                .build();
        walletTransactionRepository.save(tx);

        auth.setStatus("VOIDED");
        paymentAuthorizationRepository.save(auth);

        payment.setStatus("FAILED");
        paymentRepository.save(payment);

        log.info("Voided authorization for booking {}: released {} VND for user {}", bookingId, amount, userId);
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
                .idempotencyKey("REFUND-" + bookingId + "-" + System.currentTimeMillis())
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

        // Reverse settlements from partner and platform wallets
        reverseSettlement(bookingId, amount, payment.getAmount());

        log.info("Refunded payment for booking {}: +{} VND to user {}", bookingId, amount, userId);

        return mapPaymentToResponse(savedPayment);
    }

    @Override
    @Transactional
    public void settleBooking(String bookingCode, Long operatorId, BigDecimal tourAmount, Long hotelierId, BigDecimal hotelAmount) {
        Long targetOpId = (operatorId != null) ? operatorId : 2L;      // Default: Tour Operator Thái (User 2)
        Long targetHotelId = (hotelierId != null) ? hotelierId : 3L;   // Default: Khách sạn Mường Thanh (User 3)
        Long platformAdminId = 4L;                                     // Platform Admin Sàn SmartTrip (User 4)

        // Idempotency guard: prevent duplicate payout for the same booking
        String tourSettleKey = "SETTLE-TOUR-" + bookingCode + "-" + targetOpId;
        String hotelSettleKey = "SETTLE-HOTEL-" + bookingCode + "-" + targetHotelId;
        if (walletTransactionRepository.findByIdempotencyKey(tourSettleKey).isPresent()
                || walletTransactionRepository.findByIdempotencyKey(hotelSettleKey).isPresent()) {
            log.warn("Booking {} has already been settled. Skipping duplicate execution.", bookingCode);
            return;
        }

        BigDecimal targetTourAmount = (tourAmount != null && tourAmount.compareTo(BigDecimal.ZERO) > 0)
                ? tourAmount
                : BigDecimal.ZERO;
        BigDecimal targetHotelAmount = (hotelAmount != null && hotelAmount.compareTo(BigDecimal.ZERO) > 0)
                ? hotelAmount
                : BigDecimal.ZERO;

        BigDecimal partnerRate = new BigDecimal("0.90"); // 90% Đối tác

        // 1. Phân bổ phần Tour
        if (targetTourAmount.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal opPayout = targetTourAmount.multiply(partnerRate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal platformTourFee = targetTourAmount.subtract(opPayout);

            Wallet opWallet = getOrCreateWallet(targetOpId);
            opWallet.setBalance(opWallet.getBalance().add(opPayout));
            walletRepository.save(opWallet);

            WalletTransaction opTx = WalletTransaction.builder()
                    .wallet(opWallet)
                    .transactionType("SETTLEMENT_TOUR")
                    .amount(opPayout)
                    .referenceType("BOOKING")
                    .referenceId(bookingCode)
                    .idempotencyKey(tourSettleKey)
                    .build();
            walletTransactionRepository.save(opTx);

            Wallet adminWallet = getOrCreateWallet(platformAdminId);
            adminWallet.setBalance(adminWallet.getBalance().add(platformTourFee));
            walletRepository.save(adminWallet);

            WalletTransaction feeTx = WalletTransaction.builder()
                    .wallet(adminWallet)
                    .transactionType("COMMISSION_REVENUE")
                    .amount(platformTourFee)
                    .referenceType("BOOKING")
                    .referenceId(bookingCode)
                    .idempotencyKey("COMMISSION-TOUR-" + bookingCode)
                    .build();
            walletTransactionRepository.save(feeTx);

            log.info("Settled Tour Revenue for booking {}: +{} VND (90%) to Operator {}, +{} VND (10%) to Platform",
                    bookingCode, opPayout, targetOpId, platformTourFee);
        }

        // 2. Phân bổ phần Khách sạn
        if (targetHotelAmount.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal hotelPayout = targetHotelAmount.multiply(partnerRate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal platformHotelFee = targetHotelAmount.subtract(hotelPayout);

            Wallet hotelWallet = getOrCreateWallet(targetHotelId);
            hotelWallet.setBalance(hotelWallet.getBalance().add(hotelPayout));
            walletRepository.save(hotelWallet);

            WalletTransaction hotelTx = WalletTransaction.builder()
                    .wallet(hotelWallet)
                    .transactionType("SETTLEMENT_HOTEL")
                    .amount(hotelPayout)
                    .referenceType("BOOKING")
                    .referenceId(bookingCode)
                    .idempotencyKey(hotelSettleKey)
                    .build();
            walletTransactionRepository.save(hotelTx);

            Wallet adminWallet = getOrCreateWallet(platformAdminId);
            adminWallet.setBalance(adminWallet.getBalance().add(platformHotelFee));
            walletRepository.save(adminWallet);

            WalletTransaction feeTx = WalletTransaction.builder()
                    .wallet(adminWallet)
                    .transactionType("COMMISSION_REVENUE")
                    .amount(platformHotelFee)
                    .referenceType("BOOKING")
                    .referenceId(bookingCode)
                    .idempotencyKey("COMMISSION-HOTEL-" + bookingCode)
                    .build();
            walletTransactionRepository.save(feeTx);

            log.info("Settled Hotel Revenue for booking {}: +{} VND (90%) to Hotelier {}, +{} VND (10%) to Platform",
                    bookingCode, hotelPayout, targetHotelId, platformHotelFee);
        }
    }

    private void reverseSettlement(String bookingCode, BigDecimal refundAmount, BigDecimal totalBookingAmount) {
        try {
            List<WalletTransaction> existingSettlements = walletTransactionRepository.findByReferenceTypeAndReferenceId("BOOKING", bookingCode);
            if (existingSettlements == null || existingSettlements.isEmpty()) {
                return;
            }

            BigDecimal ratio = (totalBookingAmount != null && totalBookingAmount.compareTo(BigDecimal.ZERO) > 0)
                    ? refundAmount.divide(totalBookingAmount, 4, RoundingMode.HALF_UP)
                    : BigDecimal.ONE;

            for (WalletTransaction st : existingSettlements) {
                if ("SETTLEMENT_TOUR".equals(st.getTransactionType()) ||
                    "SETTLEMENT_HOTEL".equals(st.getTransactionType()) ||
                    "COMMISSION_REVENUE".equals(st.getTransactionType())) {

                    BigDecimal clawback = st.getAmount().multiply(ratio).setScale(2, RoundingMode.HALF_UP);
                    Wallet w = st.getWallet();
                    if (w != null && clawback.compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal newBalance = w.getBalance().subtract(clawback);
                        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
                            newBalance = BigDecimal.ZERO;
                        }
                        w.setBalance(newBalance);
                        walletRepository.save(w);

                        WalletTransaction revTx = WalletTransaction.builder()
                                .wallet(w)
                                .transactionType("SETTLEMENT_REVERSAL")
                                .amount(clawback)
                                .referenceType("BOOKING")
                                .referenceId(bookingCode)
                                .idempotencyKey("REVERSAL-" + bookingCode + "-" + w.getUserId() + "-" + System.currentTimeMillis())
                                .build();
                        walletTransactionRepository.save(revTx);
                        log.info("Reversed {} VND from wallet {} for cancelled booking {}", clawback, w.getUserId(), bookingCode);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Error during settlement reversal for booking {}: {}", bookingCode, e.getMessage());
        }
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

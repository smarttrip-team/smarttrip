package com.smarttrip.payment.controller;

import com.smarttrip.payment.dto.PaymentResponse;
import com.smarttrip.payment.dto.TopUpRequest;
import com.smarttrip.payment.dto.TransactionResponse;
import com.smarttrip.payment.dto.WalletResponse;
import com.smarttrip.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/api/payments/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "service", "payment-service",
                "status", "UP"
        ));
    }

    // ==========================================
    // Wallet APIs
    // ==========================================

    @GetMapping({"/api/v1/wallet", "/api/v1/wallets"})
    public ResponseEntity<WalletResponse> getWallet(
            @RequestParam(name = "userId", required = false) Long userId,
            @RequestHeader(name = "X-User-Id", required = false) Long headerUserId) {
        Long targetUserId = (userId != null) ? userId : headerUserId;
        if (targetUserId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(paymentService.getWalletByUserId(targetUserId));
    }

    @GetMapping("/api/v1/wallets/user/{userId}")
    public ResponseEntity<WalletResponse> getWalletByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(paymentService.getWalletByUserId(userId));
    }

    @PostMapping({"/api/v1/wallet/top-ups", "/api/v1/wallets/top-up"})
    public ResponseEntity<WalletResponse> topUp(
            @Valid @RequestBody TopUpRequest request,
            @RequestHeader(name = "X-User-Id", required = false) Long headerUserId) {
        if (request.getUserId() == null && headerUserId != null) {
            request.setUserId(headerUserId);
        }
        WalletResponse response = paymentService.topUp(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping({"/api/v1/wallet/transactions", "/api/v1/wallets/transactions"})
    public ResponseEntity<List<TransactionResponse>> getTransactions(
            @RequestParam(name = "userId", required = false) Long userId,
            @RequestHeader(name = "X-User-Id", required = false) Long headerUserId) {
        Long targetUserId = (userId != null) ? userId : headerUserId;
        if (targetUserId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(paymentService.getTransactionsByUserId(targetUserId));
    }

    // ==========================================
    // Payment & Saga Operations
    // ==========================================

    @GetMapping({"/api/v1/payments/{bookingId}", "/api/payments/booking/{bookingId}"})
    public ResponseEntity<PaymentResponse> getPaymentByBookingId(@PathVariable String bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentByBookingId(bookingId));
    }

    @PostMapping("/api/v1/payments/authorize")
    public ResponseEntity<PaymentResponse> authorize(
            @RequestParam Long userId,
            @RequestParam String bookingId,
            @RequestParam BigDecimal amount) {
        return ResponseEntity.ok(paymentService.authorize(userId, bookingId, amount));
    }

    @PostMapping("/api/v1/payments/capture")
    public ResponseEntity<PaymentResponse> capture(
            @RequestParam Long userId,
            @RequestParam String bookingId,
            @RequestParam BigDecimal amount) {
        return ResponseEntity.ok(paymentService.capture(userId, bookingId, amount));
    }

    @PostMapping("/api/v1/payments/void")
    public ResponseEntity<Void> voidAuthorization(
            @RequestParam Long userId,
            @RequestParam String bookingId) {
        paymentService.voidAuthorization(userId, bookingId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/v1/payments/refund")
    public ResponseEntity<PaymentResponse> refund(
            @RequestParam Long userId,
            @RequestParam String bookingId,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(paymentService.refund(userId, bookingId, amount, reason));
    }

    @PostMapping("/api/v1/payments/settlement")
    public ResponseEntity<Map<String, String>> settleBooking(
            @RequestParam String bookingCode,
            @RequestParam(required = false, defaultValue = "2") Long operatorId,
            @RequestParam BigDecimal tourAmount,
            @RequestParam(required = false, defaultValue = "3") Long hotelierId,
            @RequestParam(required = false, defaultValue = "0") BigDecimal hotelAmount) {
        paymentService.settleBooking(bookingCode, operatorId, tourAmount, hotelierId, hotelAmount);
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Revenue settled: 90% to partners, 10% platform commission retained",
                "bookingCode", bookingCode
        ));
    }
}

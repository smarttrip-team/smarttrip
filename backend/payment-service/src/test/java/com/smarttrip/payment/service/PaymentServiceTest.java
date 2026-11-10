package com.smarttrip.payment.service;

import com.smarttrip.payment.dto.PaymentResponse;
import com.smarttrip.payment.dto.TopUpRequest;
import com.smarttrip.payment.dto.TransactionResponse;
import com.smarttrip.payment.dto.WalletResponse;
import com.smarttrip.payment.entity.Payment;
import com.smarttrip.payment.entity.PaymentAuthorization;
import com.smarttrip.payment.entity.Wallet;
import com.smarttrip.payment.entity.WalletTransaction;
import com.smarttrip.payment.exception.BusinessException;
import com.smarttrip.payment.repository.*;
import com.smarttrip.payment.service.impl.PaymentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private WalletTransactionRepository walletTransactionRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentAuthorizationRepository paymentAuthorizationRepository;

    @Mock
    private RefundRepository refundRepository;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private Wallet mockWallet;

    @BeforeEach
    void setUp() {
        mockWallet = Wallet.builder()
                .id(1L)
                .userId(100L)
                .balance(new BigDecimal("500000.00"))
                .heldAmount(new BigDecimal("100000.00"))
                .currency("VND")
                .status("ACTIVE")
                .version(0L)
                .build();
    }

    @Test
    @DisplayName("Should return wallet with accurate available balance calculation (balance - held_amount)")
    void getWalletByUserId_calculatesAvailableBalanceCorrectly() {
        when(walletRepository.findByUserId(100L)).thenReturn(Optional.of(mockWallet));

        WalletResponse response = paymentService.getWalletByUserId(100L);

        assertThat(response).isNotNull();
        assertThat(response.getBalance()).isEqualByComparingTo("500000.00");
        assertThat(response.getHeldAmount()).isEqualByComparingTo("100000.00");
        assertThat(response.getAvailableBalance()).isEqualByComparingTo("400000.00");
    }

    @Test
    @DisplayName("Should top up wallet balance and save TOP_UP transaction")
    void topUp_success() {
        when(walletRepository.findByUserId(100L)).thenReturn(Optional.of(mockWallet));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TopUpRequest request = TopUpRequest.builder()
                .userId(100L)
                .amount(new BigDecimal("200000.00"))
                .idempotencyKey("topup-key-1")
                .build();

        WalletResponse response = paymentService.topUp(request);

        assertThat(response.getBalance()).isEqualByComparingTo("700000.00");
        verify(walletTransactionRepository, times(1)).save(any(WalletTransaction.class));
    }

    @Test
    @DisplayName("Should reject top up with zero or negative amount")
    void topUp_rejectZeroOrNegativeAmount() {
        TopUpRequest requestZero = TopUpRequest.builder()
                .userId(100L)
                .amount(BigDecimal.ZERO)
                .build();

        assertThatThrownBy(() -> paymentService.topUp(requestZero))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("greater than zero");

        TopUpRequest requestNegative = TopUpRequest.builder()
                .userId(100L)
                .amount(new BigDecimal("-50000.00"))
                .build();

        assertThatThrownBy(() -> paymentService.topUp(requestNegative))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("greater than zero");

        verify(walletRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should not double-credit top-up when idempotency key is repeated")
    void topUp_idempotencyHandled() {
        WalletTransaction existingTx = WalletTransaction.builder()
                .id(10L)
                .wallet(mockWallet)
                .amount(new BigDecimal("200000.00"))
                .idempotencyKey("dup-key")
                .build();

        when(walletTransactionRepository.findByIdempotencyKey("dup-key")).thenReturn(Optional.of(existingTx));

        TopUpRequest request = TopUpRequest.builder()
                .userId(100L)
                .amount(new BigDecimal("200000.00"))
                .idempotencyKey("dup-key")
                .build();

        WalletResponse response = paymentService.topUp(request);

        assertThat(response.getBalance()).isEqualByComparingTo("500000.00");
        verify(walletRepository, never()).save(any());
        verify(walletTransactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should authorize payment if available balance is sufficient")
    void authorize_success() {
        when(walletRepository.findByUserId(100L)).thenReturn(Optional.of(mockWallet));
        when(paymentRepository.findByBookingId("BK-100")).thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentResponse response = paymentService.authorize(100L, "BK-100", new BigDecimal("200000.00"));

        assertThat(response.getStatus()).isEqualTo("AUTHORIZED");
        assertThat(mockWallet.getHeldAmount()).isEqualByComparingTo("300000.00");
        assertThat(mockWallet.getAvailableBalance()).isEqualByComparingTo("200000.00");
        verify(paymentAuthorizationRepository, times(1)).save(any(PaymentAuthorization.class));
    }

    @Test
    @DisplayName("Should reject authorization if available balance is insufficient")
    void authorize_insufficientBalance_throwsException() {
        when(walletRepository.findByUserId(100L)).thenReturn(Optional.of(mockWallet));

        BigDecimal tooMuch = new BigDecimal("450000.00"); // available balance is only 400000.00

        assertThatThrownBy(() -> paymentService.authorize(100L, "BK-100", tooMuch))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Insufficient wallet balance");

        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should capture authorized payment, decrease balance and held amount")
    void capture_success() {
        when(walletRepository.findByUserId(100L)).thenReturn(Optional.of(mockWallet));
        Payment payment = Payment.builder()
                .id(1L)
                .bookingId("BK-100")
                .amount(new BigDecimal("100000.00"))
                .status("AUTHORIZED")
                .build();
        when(paymentRepository.findByBookingId("BK-100")).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentResponse response = paymentService.capture(100L, "BK-100", new BigDecimal("100000.00"));

        assertThat(response.getStatus()).isEqualTo("COMPLETED");
        assertThat(mockWallet.getBalance()).isEqualByComparingTo("400000.00");
        assertThat(mockWallet.getHeldAmount()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("Should void authorization and release held amount")
    void voidAuthorization_success() {
        when(walletRepository.findByUserId(100L)).thenReturn(Optional.of(mockWallet));
        Payment payment = Payment.builder()
                .id(1L)
                .bookingId("BK-100")
                .amount(new BigDecimal("100000.00"))
                .status("AUTHORIZED")
                .build();
        PaymentAuthorization auth = PaymentAuthorization.builder()
                .id(5L)
                .payment(payment)
                .authorizedAmount(new BigDecimal("100000.00"))
                .status("AUTHORIZED")
                .build();
        when(paymentRepository.findByBookingId("BK-100")).thenReturn(Optional.of(payment));
        when(paymentAuthorizationRepository.findTopByPaymentIdOrderByCreatedAtDesc(1L)).thenReturn(Optional.of(auth));

        paymentService.voidAuthorization(100L, "BK-100");

        assertThat(mockWallet.getHeldAmount()).isEqualByComparingTo("0.00");
        assertThat(payment.getStatus()).isEqualTo("VOIDED");
        assertThat(auth.getStatus()).isEqualTo("VOIDED");
    }

    @Test
    @DisplayName("Should refund payment and restore wallet balance")
    void refund_success() {
        when(walletRepository.findByUserId(100L)).thenReturn(Optional.of(mockWallet));
        Payment payment = Payment.builder()
                .id(1L)
                .bookingId("BK-100")
                .amount(new BigDecimal("100000.00"))
                .status("COMPLETED")
                .build();
        when(paymentRepository.findByBookingId("BK-100")).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentResponse response = paymentService.refund(100L, "BK-100", new BigDecimal("100000.00"), "Flight cancelled");

        assertThat(response.getStatus()).isEqualTo("REFUNDED");
        assertThat(mockWallet.getBalance()).isEqualByComparingTo("600000.00");
        verify(refundRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should get transaction history ordered by created_at desc")
    void getTransactionsByUserId_success() {
        when(walletRepository.findByUserId(100L)).thenReturn(Optional.of(mockWallet));
        WalletTransaction tx1 = WalletTransaction.builder()
                .id(1L)
                .wallet(mockWallet)
                .transactionType("TOP_UP")
                .amount(new BigDecimal("500000.00"))
                .createdAt(LocalDateTime.now().minusHours(1))
                .build();
        when(walletTransactionRepository.findByWalletIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(tx1));

        List<TransactionResponse> result = paymentService.getTransactionsByUserId(100L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTransactionType()).isEqualTo("TOP_UP");
    }
}

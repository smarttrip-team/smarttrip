package com.smarttrip.payment.repository;

import com.smarttrip.payment.entity.PaymentAuthorization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentAuthorizationRepository extends JpaRepository<PaymentAuthorization, Long> {
    List<PaymentAuthorization> findByPaymentId(Long paymentId);
}

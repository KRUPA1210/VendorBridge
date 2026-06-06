package com.mkdh.vendorbridge.repositories;

import com.mkdh.vendorbridge.domain.entities.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    Optional<Invoice> findByPurchaseOrderId(UUID purchaseOrderId);

    Page<Invoice> findByVendorId(UUID vendorId, Pageable pageable);

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    long countByInvoiceNumberStartingWith(String prefix);

    // Spending summary aggregations
    @Query("SELECT SUM(i.grandTotal) FROM Invoice i WHERE i.createdAt BETWEEN :from AND :to")
    BigDecimal sumGrandTotalBetween(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT SUM(i.gstAmount) FROM Invoice i WHERE i.createdAt BETWEEN :from AND :to")
    BigDecimal sumGstAmountBetween(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT SUM(i.subtotal) FROM Invoice i WHERE i.createdAt BETWEEN :from AND :to")
    BigDecimal sumSubtotalBetween(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
}
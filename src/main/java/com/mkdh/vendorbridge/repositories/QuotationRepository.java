package com.mkdh.vendorbridge.repositories;

import com.mkdh.vendorbridge.domain.entities.Quotation;
import com.mkdh.vendorbridge.domain.entities.QuotationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, UUID> {

    List<Quotation> findByRfqId(UUID rfqId);

    List<Quotation> findByVendorId(UUID vendorId);

    Optional<Quotation> findByRfqIdAndVendorId(UUID rfqId, UUID vendorId);

    boolean existsByRfqIdAndVendorId(UUID rfqId, UUID vendorId);

    // All quotations for an RFQ sorted by price ascending (for comparison)
    @Query("SELECT q FROM Quotation q WHERE q.rfq.id = :rfqId ORDER BY q.pricePerUnit ASC")
    List<Quotation> findByRfqIdOrderByPriceAsc(@Param("rfqId") UUID rfqId);

    Optional<Quotation> findByRfqIdAndStatus(UUID rfqId, QuotationStatus status);
}
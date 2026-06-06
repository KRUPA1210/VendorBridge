package com.mkdh.vendorbridge.repositories;

import com.mkdh.vendorbridge.domain.entities.PurchaseOrder;
import com.mkdh.vendorbridge.domain.entities.PurchaseOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID> {

    Page<PurchaseOrder> findByStatus(PurchaseOrderStatus status, Pageable pageable);

    List<PurchaseOrder> findByVendorId(UUID vendorId);

    Optional<PurchaseOrder> findByApprovalId(UUID approvalId);

    Optional<PurchaseOrder> findByPoNumber(String poNumber);

    // For auto-generating sequential PO numbers: count POs in a given year
    long countByPoNumberStartingWith(String prefix);
}
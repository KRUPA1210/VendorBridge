package com.mkdh.vendorbridge.repositories;

import com.mkdh.vendorbridge.domain.entities.Rfq;
import com.mkdh.vendorbridge.domain.entities.RfqStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RfqRepository extends JpaRepository<Rfq, UUID> {

    Page<Rfq> findByStatus(RfqStatus status, Pageable pageable);

    @Query("SELECT r FROM Rfq r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:search IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.productService) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Rfq> findByStatusAndSearch(
            @Param("status") RfqStatus status,
            @Param("search") String search,
            Pageable pageable);

    // RFQs where a specific vendor is assigned
    @Query("SELECT r FROM Rfq r JOIN r.assignedVendors v WHERE v.id = :vendorId")
    List<Rfq> findByAssignedVendorId(@Param("vendorId") UUID vendorId);

    Page<Rfq> findAll(Pageable pageable);
}
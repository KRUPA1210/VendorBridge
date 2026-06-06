package com.mkdh.vendorbridge.repositories;

import com.mkdh.vendorbridge.domain.entities.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VendorRepository extends JpaRepository<Vendor, UUID> {
    Optional<Vendor> findByEmail(String email);

    Optional<Vendor> findByGstNumber(String gstNumber);

    List<Vendor> findByVendorNameContainingIgnoreCase(String vendorName);

    Page<Vendor> findByVendorNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String vendorName, String email, Pageable pageable);
}

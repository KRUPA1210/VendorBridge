package com.mkdh.vendorbridge.repositories;

import com.mkdh.vendorbridge.domain.entities.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface VendorRepository extends JpaRepository<Vendor, UUID> {
    Optional<Vendor> findByEmail(String email);

    Optional<Vendor> findByGstNumber(String gstNumber);
}

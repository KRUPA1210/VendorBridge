package com.mkdh.vendorbridge.services;

import com.mkdh.vendorbridge.domain.CreateVendorRequest;
import com.mkdh.vendorbridge.domain.dtos.CreateVendorRequestDto;
import com.mkdh.vendorbridge.domain.dtos.CreateVendorResponseDto;
import com.mkdh.vendorbridge.domain.entities.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface VendorService {

    Vendor createvendor(UUID userId, CreateVendorRequest createVendorRequest);

    Page<CreateVendorResponseDto> getAllVendors(String search, Pageable pageable);

    CreateVendorResponseDto getVendorById(UUID vendorId);

    CreateVendorResponseDto updateVendor(UUID vendorId, CreateVendorRequest request);

    void deleteVendor(UUID vendorId);
}
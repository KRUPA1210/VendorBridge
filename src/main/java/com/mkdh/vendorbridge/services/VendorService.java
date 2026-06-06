package com.mkdh.vendorbridge.services;

import com.mkdh.vendorbridge.domain.CreateVendorRequest;
import com.mkdh.vendorbridge.domain.dtos.CreateVendorRequestDto;
import com.mkdh.vendorbridge.domain.entities.Vendor;

import java.util.UUID;

public interface VendorService {
    Vendor createvendor(UUID userid, CreateVendorRequest createVendorRequest
    );
}

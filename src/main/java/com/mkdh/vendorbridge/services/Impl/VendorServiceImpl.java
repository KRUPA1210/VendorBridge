package com.mkdh.vendorbridge.services.Impl;

import com.mkdh.vendorbridge.domain.CreateVendorRequest;
import com.mkdh.vendorbridge.domain.dtos.CreateVendorRequestDto;
import com.mkdh.vendorbridge.domain.entities.Vendor;
import com.mkdh.vendorbridge.repositories.VendorRepository;
import com.mkdh.vendorbridge.services.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VendorServiceImpl implements VendorService {

    private final VendorRepository vendorRepository;
    @Override
    public Vendor createvendor(UUID userid, CreateVendorRequest createVendorRequest) {
        Vendor vendor = new Vendor();
        vendor.setVendorName(createVendorRequest.getVendorName());
        vendor.setEmail(createVendorRequest.getEmail());
        vendor.setAddress(createVendorRequest.getAddress());
        vendor.setGstNumber( createVendorRequest.getGstNumber() );
        vendor.setPhoneNo( createVendorRequest.getPhoneNo() );
        return vendorRepository.save(vendor);
    }
}

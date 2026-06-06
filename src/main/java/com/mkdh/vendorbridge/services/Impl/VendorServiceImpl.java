package com.mkdh.vendorbridge.services.Impl;

import com.mkdh.vendorbridge.domain.CreateVendorRequest;
import com.mkdh.vendorbridge.domain.dtos.CreateVendorResponseDto;
import com.mkdh.vendorbridge.domain.entities.Vendor;
import com.mkdh.vendorbridge.exceptions.ResourceNotFoundException;
import com.mkdh.vendorbridge.repositories.VendorRepository;
import com.mkdh.vendorbridge.services.VendorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VendorServiceImpl implements VendorService {

    private final VendorRepository vendorRepository;

    @Override
    public Vendor createvendor(UUID userId, CreateVendorRequest req) {
        if (vendorRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new IllegalArgumentException("A vendor with this email already exists");
        }
        if (vendorRepository.findByGstNumber(req.getGstNumber()).isPresent()) {
            throw new IllegalArgumentException("A vendor with this GST number already exists");
        }

        Vendor vendor = new Vendor();
        vendor.setVendorName(req.getVendorName());
        vendor.setEmail(req.getEmail());
        vendor.setAddress(req.getAddress());
        vendor.setGstNumber(req.getGstNumber());
        vendor.setPhoneNo(req.getPhoneNo());
        vendor.setRating(0);
        return vendorRepository.save(vendor);
    }

    @Override
    public Page<CreateVendorResponseDto> getAllVendors(String search, Pageable pageable) {
        Page<Vendor> vendors;
        if (search != null && !search.isBlank()) {
            vendors = vendorRepository.findByVendorNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    search, search, pageable);
        } else {
            vendors = vendorRepository.findAll(pageable);
        }
        return vendors.map(this::toResponseDto);
    }

    @Override
    public CreateVendorResponseDto getVendorById(UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + vendorId));
        return toResponseDto(vendor);
    }

    @Override
    @Transactional
    public CreateVendorResponseDto updateVendor(UUID vendorId, CreateVendorRequest req) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + vendorId));

        vendor.setVendorName(req.getVendorName());
        vendor.setEmail(req.getEmail());
        vendor.setPhoneNo(req.getPhoneNo());
        vendor.setGstNumber(req.getGstNumber());
        vendor.setAddress(req.getAddress());

        return toResponseDto(vendorRepository.save(vendor));
    }

    @Override
    public void deleteVendor(UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + vendorId));
        vendorRepository.delete(vendor);
    }

    private CreateVendorResponseDto toResponseDto(Vendor v) {
        return CreateVendorResponseDto.builder()
                .vendorName(v.getVendorName())
                .email(v.getEmail())
                .phoneNo(v.getPhoneNo())
                .gstNumber(v.getGstNumber())
                .address(v.getAddress())
                .build();
    }
}
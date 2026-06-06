package com.mkdh.vendorbridge.controllers;

import com.mkdh.vendorbridge.domain.CreateVendorRequest;
import com.mkdh.vendorbridge.domain.dtos.CreateVendorRequestDto;
import com.mkdh.vendorbridge.domain.dtos.CreateVendorResponseDto;
import com.mkdh.vendorbridge.domain.entities.Vendor;
import com.mkdh.vendorbridge.services.VendorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/vendor")
public class VendorController {

    private final VendorService vendorService;

    @PostMapping("/create")
    public ResponseEntity<CreateVendorResponseDto> createVendor(
            @Valid @RequestBody CreateVendorRequestDto dto
    ) {

        CreateVendorRequest request = CreateVendorRequest.builder()
                .vendorName(dto.getVendorName())
                .email(dto.getEmail())
                .phoneNo(dto.getPhoneNo())
                .gstNumber(dto.getGstNumber())
                .address(dto.getAddress())
                .build();

        Vendor vendor = vendorService.createvendor(null, request);

        CreateVendorResponseDto response =
                CreateVendorResponseDto.builder()
                        .vendorName(vendor.getVendorName())
                        .email(vendor.getEmail())
                        .phoneNo(vendor.getPhoneNo())
                        .gstNumber(vendor.getGstNumber())
                        .address(vendor.getAddress())
                        .build();

        return ResponseEntity.ok(response);
    }


}

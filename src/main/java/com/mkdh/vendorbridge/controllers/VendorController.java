package com.mkdh.vendorbridge.controllers;

import com.mkdh.vendorbridge.domain.CreateVendorRequest;
import com.mkdh.vendorbridge.domain.dtos.CreateVendorRequestDto;
import com.mkdh.vendorbridge.domain.dtos.CreateVendorResponseDto;
import com.mkdh.vendorbridge.domain.entities.Vendor;
import com.mkdh.vendorbridge.security.VendorBridgeUserDetails;
import com.mkdh.vendorbridge.services.VendorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/vendor")
public class VendorController {

    private final VendorService vendorService;

    // POST /api/v1/vendor/create  — Admin or Procurement Officer
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<CreateVendorResponseDto> createVendor(
            @Valid @RequestBody CreateVendorRequestDto dto,
            @AuthenticationPrincipal VendorBridgeUserDetails userDetails) {

        CreateVendorRequest request = CreateVendorRequest.builder()
                .vendorName(dto.getVendorName())
                .email(dto.getEmail())
                .phoneNo(dto.getPhoneNo())
                .gstNumber(dto.getGstNumber())
                .address(dto.getAddress())
                .build();

        Vendor vendor = vendorService.createvendor(userDetails.getId(), request);

        CreateVendorResponseDto response = CreateVendorResponseDto.builder()
                .vendorName(vendor.getVendorName())
                .email(vendor.getEmail())
                .phoneNo(vendor.getPhoneNo())
                .gstNumber(vendor.getGstNumber())
                .address(vendor.getAddress())
                .build();

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // GET /api/v1/vendor/all  — List all vendors with optional search/filter
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<Page<CreateVendorResponseDto>> getAllVendors(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<CreateVendorResponseDto> vendors = vendorService.getAllVendors(search, pageable);
        return ResponseEntity.ok(vendors);
    }

    // GET /api/v1/vendor/{vendorId}  — Get single vendor by ID
    @GetMapping("/{vendorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<CreateVendorResponseDto> getVendorById(
            @PathVariable UUID vendorId) {
        CreateVendorResponseDto vendor = vendorService.getVendorById(vendorId);
        return ResponseEntity.ok(vendor);
    }

    // PUT /api/v1/vendor/{vendorId}  — Update vendor details
    @PutMapping("/{vendorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<CreateVendorResponseDto> updateVendor(
            @PathVariable UUID vendorId,
            @Valid @RequestBody CreateVendorRequestDto dto) {
        CreateVendorRequest request = CreateVendorRequest.builder()
                .vendorName(dto.getVendorName())
                .email(dto.getEmail())
                .phoneNo(dto.getPhoneNo())
                .gstNumber(dto.getGstNumber())
                .address(dto.getAddress())
                .build();
        CreateVendorResponseDto updated = vendorService.updateVendor(vendorId, request);
        return ResponseEntity.ok(updated);
    }

    // DELETE /api/v1/vendor/{vendorId}  — Admin only
    @DeleteMapping("/{vendorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteVendor(@PathVariable UUID vendorId) {
        vendorService.deleteVendor(vendorId);
        return ResponseEntity.ok(Map.of("message", "Vendor deleted successfully"));
    }
}
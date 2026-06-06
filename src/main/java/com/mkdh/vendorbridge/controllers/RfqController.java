package com.mkdh.vendorbridge.controllers;

import com.mkdh.vendorbridge.domain.dtos.CreateRfqRequestDto;
import com.mkdh.vendorbridge.domain.dtos.RfqResponseDto;
import com.mkdh.vendorbridge.security.VendorBridgeUserDetails;
import com.mkdh.vendorbridge.services.RfqService;
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
@RequestMapping("/api/v1/rfq")
public class RfqController {

    private final RfqService rfqService;

    // POST /api/v1/rfq/create
    // Actor: Procurement Officer
    // Creates RFQ with title, product/service, quantity, deadline, and assigns vendors
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<RfqResponseDto> createRfq(
            @Valid @RequestBody CreateRfqRequestDto dto,
            @AuthenticationPrincipal VendorBridgeUserDetails userDetails) {
        RfqResponseDto rfq = rfqService.createRfq(dto, userDetails.getId());
        return new ResponseEntity<>(rfq, HttpStatus.CREATED);
    }

    // GET /api/v1/rfq/all
    // Actor: Procurement Officer / Admin — see all RFQs with optional search
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<Page<RfqResponseDto>> getAllRfqs(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<RfqResponseDto> rfqs = rfqService.getAllRfqs(status, pageable);
        return ResponseEntity.ok(rfqs);
    }

    // GET /api/v1/rfq/{rfqId}
    // Get single RFQ by ID — Procurement Officer, Admin, or assigned Vendor
    @GetMapping("/{rfqId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR')")
    public ResponseEntity<RfqResponseDto> getRfqById(@PathVariable UUID rfqId) {
        RfqResponseDto rfq = rfqService.getRfqById(rfqId);
        return ResponseEntity.ok(rfq);
    }

    // GET /api/v1/rfq/my-rfqs
    // Actor: Vendor — view only RFQs assigned to this vendor
    @GetMapping("/my-rfqs")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<RfqResponseDto>> getMyRfqs(
            @AuthenticationPrincipal VendorBridgeUserDetails userDetails) {
        List<RfqResponseDto> rfqs = rfqService.getRfqsForVendor(userDetails.getId());
        return ResponseEntity.ok(rfqs);
    }

    // PUT /api/v1/rfq/{rfqId}
    // Actor: Procurement Officer — update RFQ before deadline
    @PutMapping("/{rfqId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<RfqResponseDto> updateRfq(
            @PathVariable UUID rfqId,
            @Valid @RequestBody CreateRfqRequestDto dto,
            @AuthenticationPrincipal VendorBridgeUserDetails userDetails) {
        RfqResponseDto updated = rfqService.updateRfq(rfqId, dto, userDetails.getId());
        return ResponseEntity.ok(updated);
    }

    // DELETE /api/v1/rfq/{rfqId}
    // Actor: Admin only
    @DeleteMapping("/{rfqId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteRfq(@PathVariable UUID rfqId) {
        rfqService.deleteRfq(rfqId);
        return ResponseEntity.ok(Map.of("message", "RFQ deleted successfully"));
    }

    // POST /api/v1/rfq/{rfqId}/close
    // Actor: Procurement Officer — manually close an RFQ (no more quotations accepted)
    @PostMapping("/{rfqId}/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<RfqResponseDto> closeRfq(@PathVariable UUID rfqId) {
        RfqResponseDto closed = rfqService.closeRfq(rfqId);
        return ResponseEntity.ok(closed);
    }
}
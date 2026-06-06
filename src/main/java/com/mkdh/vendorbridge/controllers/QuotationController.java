package com.mkdh.vendorbridge.controllers;

import com.mkdh.vendorbridge.domain.dtos.QuotationComparisonDto;
import com.mkdh.vendorbridge.domain.dtos.QuotationRequestDto;
import com.mkdh.vendorbridge.domain.dtos.QuotationResponseDto;
import com.mkdh.vendorbridge.security.VendorBridgeUserDetails;
import com.mkdh.vendorbridge.services.QuotationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
@RequestMapping("/api/v1/quotation")
public class QuotationController {

    private final QuotationService quotationService;

    // POST /api/v1/quotation/submit/{rfqId}
    // Actor: Vendor — submit a quotation for an assigned RFQ
    // Includes: price per unit, delivery timeline, notes/comments
    @PostMapping("/submit/{rfqId}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<QuotationResponseDto> submitQuotation(
            @PathVariable UUID rfqId,
            @Valid @RequestBody QuotationRequestDto dto,
            @AuthenticationPrincipal VendorBridgeUserDetails userDetails) {
        QuotationResponseDto quotation = quotationService.submitQuotation(rfqId, dto, userDetails.getId());
        return new ResponseEntity<>(quotation, HttpStatus.CREATED);
    }

    // PUT /api/v1/quotation/{quotationId}
    // Actor: Vendor — edit their own quotation before the RFQ deadline
    @PutMapping("/{quotationId}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<QuotationResponseDto> editQuotation(
            @PathVariable UUID quotationId,
            @Valid @RequestBody QuotationRequestDto dto,
            @AuthenticationPrincipal VendorBridgeUserDetails userDetails) {
        QuotationResponseDto updated = quotationService.editQuotation(quotationId, dto, userDetails.getId());
        return ResponseEntity.ok(updated);
    }

    // GET /api/v1/quotation/rfq/{rfqId}
    // Actor: Procurement Officer / Admin — view all quotations for an RFQ
    @GetMapping("/rfq/{rfqId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<List<QuotationResponseDto>> getQuotationsByRfq(@PathVariable UUID rfqId) {
        List<QuotationResponseDto> quotations = quotationService.getQuotationsByRfq(rfqId);
        return ResponseEntity.ok(quotations);
    }

    // GET /api/v1/quotation/rfq/{rfqId}/compare
    // Actor: Procurement Officer — side-by-side comparison with best price highlight
    // Returns sorted list with best price flagged
    @GetMapping("/rfq/{rfqId}/compare")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<QuotationComparisonDto> compareQuotations(@PathVariable UUID rfqId) {
        QuotationComparisonDto comparison = quotationService.compareQuotations(rfqId);
        return ResponseEntity.ok(comparison);
    }

    // GET /api/v1/quotation/my-quotations
    // Actor: Vendor — view their own submitted quotations
    @GetMapping("/my-quotations")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<QuotationResponseDto>> getMyQuotations(
            @AuthenticationPrincipal VendorBridgeUserDetails userDetails) {
        List<QuotationResponseDto> quotations = quotationService.getQuotationsByVendor(userDetails.getId());
        return ResponseEntity.ok(quotations);
    }

    // GET /api/v1/quotation/{quotationId}
    // Get a single quotation by ID
    @GetMapping("/{quotationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR')")
    public ResponseEntity<QuotationResponseDto> getQuotationById(@PathVariable UUID quotationId) {
        QuotationResponseDto quotation = quotationService.getQuotationById(quotationId);
        return ResponseEntity.ok(quotation);
    }

    // POST /api/v1/quotation/{quotationId}/select
    // Actor: Procurement Officer — select a winning quotation before sending for approval
    @PostMapping("/{quotationId}/select")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<QuotationResponseDto> selectQuotation(
            @PathVariable UUID quotationId,
            @AuthenticationPrincipal VendorBridgeUserDetails userDetails) {
        QuotationResponseDto selected = quotationService.selectQuotation(quotationId, userDetails.getId());
        return ResponseEntity.ok(selected);
    }
}
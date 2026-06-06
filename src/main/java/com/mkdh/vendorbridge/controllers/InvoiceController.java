package com.mkdh.vendorbridge.controllers;

import com.mkdh.vendorbridge.domain.dtos.InvoiceResponseDto;
import com.mkdh.vendorbridge.security.VendorBridgeUserDetails;
import com.mkdh.vendorbridge.services.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/invoice")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping("/generate/{poId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<InvoiceResponseDto> generateInvoice(
            @PathVariable UUID poId,
            @AuthenticationPrincipal VendorBridgeUserDetails userDetails) {
        InvoiceResponseDto invoice = invoiceService.generateInvoice(poId, userDetails.getId());
        return ResponseEntity.ok(invoice);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<Page<InvoiceResponseDto>> getAllInvoices(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<InvoiceResponseDto> invoices = invoiceService.getAllInvoices(pageable);
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/{invoiceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR')")
    public ResponseEntity<InvoiceResponseDto> getInvoiceById(@PathVariable UUID invoiceId) {
        InvoiceResponseDto invoice = invoiceService.getInvoiceById(invoiceId);
        return ResponseEntity.ok(invoice);
    }

    @GetMapping("/purchase-order/{poId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<InvoiceResponseDto> getInvoiceByPurchaseOrder(@PathVariable UUID poId) {
        InvoiceResponseDto invoice = invoiceService.getInvoiceByPurchaseOrderId(poId);
        return ResponseEntity.ok(invoice);
    }

    @GetMapping("/{invoiceId}/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR')")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable UUID invoiceId) {
        byte[] pdf = invoiceService.generatePdf(invoiceId);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=INV-" + invoiceId + ".pdf")
                .body(pdf);
    }

    @PostMapping("/{invoiceId}/email")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<Map<String, String>> emailInvoice(@PathVariable UUID invoiceId) {
        invoiceService.emailInvoiceToVendor(invoiceId);
        return ResponseEntity.ok(Map.of("message", "Invoice emailed to vendor successfully"));
    }

    @GetMapping("/vendor/my-invoices")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Page<InvoiceResponseDto>> getMyInvoices(
            @AuthenticationPrincipal VendorBridgeUserDetails userDetails,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<InvoiceResponseDto> invoices = invoiceService.getInvoicesByVendor(userDetails.getId(), pageable);
        return ResponseEntity.ok(invoices);
    }
}

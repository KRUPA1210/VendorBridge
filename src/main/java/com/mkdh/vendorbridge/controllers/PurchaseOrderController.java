package com.mkdh.vendorbridge.controllers;

import com.mkdh.vendorbridge.domain.dtos.PurchaseOrderResponseDto;
import com.mkdh.vendorbridge.security.VendorBridgeUserDetails;
import com.mkdh.vendorbridge.services.PurchaseOrderService;
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
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/purchase-order")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    // POST /api/v1/purchase-order/generate/{approvalId}
    // Actor: System / Procurement Officer
    // Auto-generates PO from an approved quotation
    // PO Number: auto-generated e.g. PO-2026-001
    // Status flow: Draft → Approved → Sent
    @PostMapping("/generate/{approvalId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<PurchaseOrderResponseDto> generatePurchaseOrder(
            @PathVariable UUID approvalId,
            @AuthenticationPrincipal VendorBridgeUserDetails userDetails) {
        PurchaseOrderResponseDto po = purchaseOrderService.generatePurchaseOrder(approvalId, userDetails.getId());
        return new ResponseEntity<>(po, HttpStatus.CREATED);
    }

    // GET /api/v1/purchase-order/all
    // Actor: Procurement Officer / Admin — list all POs with optional status filter
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<Page<PurchaseOrderResponseDto>> getAllPurchaseOrders(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<PurchaseOrderResponseDto> orders = purchaseOrderService.getAllPurchaseOrders(status, pageable);
        return ResponseEntity.ok(orders);
    }

    // GET /api/v1/purchase-order/{poId}
    // Get a single PO by ID
    @GetMapping("/{poId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR')")
    public ResponseEntity<PurchaseOrderResponseDto> getPurchaseOrderById(@PathVariable UUID poId) {
        PurchaseOrderResponseDto po = purchaseOrderService.getPurchaseOrderById(poId);
        return ResponseEntity.ok(po);
    }

    // GET /api/v1/purchase-order/vendor/my-orders
    // Actor: Vendor — view purchase orders sent to them
    @GetMapping("/vendor/my-orders")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<PurchaseOrderResponseDto>> getMyPurchaseOrders(
            @AuthenticationPrincipal VendorBridgeUserDetails userDetails) {
        List<PurchaseOrderResponseDto> orders = purchaseOrderService.getPurchaseOrdersByVendor(userDetails.getId());
        return ResponseEntity.ok(orders);
    }

    // POST /api/v1/purchase-order/{poId}/send
    // Actor: Procurement Officer — mark PO as sent to vendor (triggers notification)
    @PostMapping("/{poId}/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<PurchaseOrderResponseDto> sendPurchaseOrder(@PathVariable UUID poId) {
        PurchaseOrderResponseDto po = purchaseOrderService.sendPurchaseOrder(poId);
        return ResponseEntity.ok(po);
    }

    // GET /api/v1/purchase-order/{poId}/download
    // Actor: Procurement Officer / Vendor — download PO as PDF
    @GetMapping("/{poId}/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR')")
    public ResponseEntity<byte[]> downloadPurchaseOrderPdf(@PathVariable UUID poId) {
        byte[] pdf = purchaseOrderService.generatePdf(poId);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=PO-" + poId + ".pdf")
                .body(pdf);
    }
}
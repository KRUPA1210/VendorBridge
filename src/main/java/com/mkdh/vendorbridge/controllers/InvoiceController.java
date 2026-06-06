package com.mkdh.vendorbridge.controllers;

import com.mkdh.vendorbridge.domain.dtos.ActivityLogResponseDto;
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

    // POST /api/v1/invoice/generate/{poId}
    // Actor: Procurement Officer
    // Generates invoice from a Purchase Order
    // Auto invoice number e.g. INV-2026-001
    // Calculates: subtotal, GST (18%), grand total
    @PostMapping("/generate/{poId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<InvoiceResponseDto> generateInvoice(
            @PathVariable UUID poId,
            @AuthenticationPrincipal VendorBridgeUserDetails userDetails) {
        InvoiceResponseDto invoice = invoiceService.generateInvoice(poId, userDetails.getId());
        return ResponseEntity.ok(invoice);
    }

    // GET /api/v1/invoice/all
    // Actor: Procurement Officer / Admin — list all invoices
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<Page<InvoiceResponseDto>> getAllInvoices(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<InvoiceResponseDto> invoices = invoiceService.getAllInvoices(pageable);
        return ResponseEntity.ok(invoices);
    }

    // GET /api/v1/invoice/{invoiceId}
    // Get a single invoice by ID
    @GetMapping("/{invoiceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR')")
    public ResponseEntity<InvoiceResponseDto> getInvoiceById(@PathVariable UUID invoiceId) {
        InvoiceResponseDto invoice = invoiceService.getInvoiceById(invoiceId);
        return ResponseEntity.ok(invoice);
    }

    // GET /api/v1/invoice/purchase-order/{poId}
    // Get invoice linked to a specific PO
    @GetMapping("/purchase-order/{poId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<InvoiceResponseDto> getInvoiceByPurchaseOrder(@PathVariable UUID poId) {
        InvoiceResponseDto invoice = invoiceService.getInvoiceByPurchaseOrderId(poId);
        return ResponseEntity.ok(invoice);
    }

    // GET /api/v1/invoice/{invoiceId}/download
    // Actor: Procurement Officer / Vendor — Download PDF
    // e.g. INV-2026-001.pdf with tax breakdown
    @GetMapping("/{invoiceId}/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR')")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable UUID invoiceId) {
        byte[] pdf = invoiceService.generatePdf(invoiceId);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=INV-" + invoiceId + ".pdf")
                .body(pdf);
    }

    // POST /api/v1/invoice/{invoiceId}/email
    // Actor: Procurement Officer — email invoice directly to vendor
    @PostMapping("/{invoiceId}/email")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<Map<String, String>> emailInvoice(@PathVariable UUID invoiceId) {
        invoiceService.emailInvoiceToVendor(invoiceId);
        return ResponseEntity.ok(Map.of("message", "Invoice emailed to vendor successfully"));
    }

    // GET /api/v1/invoice/vendor/my-invoices
 package com.mkdh.vendorbridge.controllers;

import com.mkdh.vendorbridge.domain.dtos.ActivityLogResponseDto;
import com.mkdh.vendorbridge.security.VendorBridgeUserDetails;
import com.mkdh.vendorbridge.services.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

    @RestController
    @RequiredArgsConstructor
    @RequestMapping("/api/v1/activity-log")
    public class ActivityLogController {

        private final ActivityLogService activityLogService;

        // GET /api/v1/activity-log/all
        // Actor: Admin — full audit trail of all system activities
        // Covers: RFQ notifications, approval alerts, status updates
        @GetMapping("/all")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<Page<ActivityLogResponseDto>> getAllLogs(
                @RequestParam(required = false) String entityType,
                @RequestParam(required = false) String action,
                @PageableDefault(size = 20) Pageable pageable) {
            Page<ActivityLogResponseDto> logs = activityLogService.getAllLogs(entityType, action, pageable);
            return ResponseEntity.ok(logs);
        }

        // GET /api/v1/activity-log/rfq/{rfqId}
        // Actor: Procurement Officer / Admin — full timeline for a specific RFQ
        @GetMapping("/rfq/{rfqId}")
        @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
        public ResponseEntity<Page<ActivityLogResponseDto>> getLogsByRfq(
                @PathVariable UUID rfqId,
                @PageableDefault(size = 20) Pageable pageable) {
            Page<ActivityLogResponseDto> logs = activityLogService.getLogsByRfq(rfqId, pageable);
            return ResponseEntity.ok(logs);
        }

        // GET /api/v1/activity-log/vendor/{vendorId}
        // Actor: Admin — audit log for a specific vendor's activity
        @GetMapping("/vendor/{vendorId}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<Page<ActivityLogResponseDto>> getLogsByVendor(
                @PathVariable UUID vendorId,
                @PageableDefault(size = 20) Pageable pageable) {
            Page<ActivityLogResponseDto> logs = activityLogService.getLogsByVendor(vendorId, pageable);
            return ResponseEntity.ok(logs);
        }

        // GET /api/v1/activity-log/my-notifications
        // Actor: Any authenticated user — get their own notifications/alerts
        @GetMapping("/my-notifications")
        public ResponseEntity<Page<ActivityLogResponseDto>> getMyNotifications(
                @AuthenticationPrincipal VendorBridgeUserDetails userDetails,
                @RequestParam(required = false, defaultValue = "false") boolean unreadOnly,
                @PageableDefault(size = 10) Pageable pageable) {
            Page<ActivityLogResponseDto> logs = activityLogService.getNotificationsForUser(
                    userDetails.getId(), unreadOnly, pageable);
            return ResponseEntity.ok(logs);
        }
    }   // Actor: Vendor — view invoices related to their purchase orders
    @GetMapping("/vendor/my-invoices")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Page<InvoiceResponseDto>> getMyInvoices(
            @AuthenticationPrincipal VendorBridgeUserDetails userDetails,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<InvoiceResponseDto> invoices = invoiceService.getInvoicesByVendor(userDetails.getId(), pageable);
        return ResponseEntity.ok(invoices);
    }
}
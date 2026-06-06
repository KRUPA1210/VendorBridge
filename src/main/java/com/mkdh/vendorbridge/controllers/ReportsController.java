package com.mkdh.vendorbridge.controllers;

import com.mkdh.vendorbridge.domain.dtos.VendorPerformanceDto;
import com.mkdh.vendorbridge.domain.dtos.SpendingSummaryDto;
import com.mkdh.vendorbridge.services.ReportsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/reports")
public class ReportsController {

    private final ReportsService reportsService;

    // GET /api/v1/reports/spending-summary
    // Actor: Admin / Procurement Officer
    // Total procurement spending over a date range
    // Includes: total POs, total invoiced amount, GST breakdown
    @GetMapping("/spending-summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<SpendingSummaryDto> getSpendingSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        SpendingSummaryDto summary = reportsService.getSpendingSummary(from, to);
        return ResponseEntity.ok(summary);
    }

    // GET /api/v1/reports/vendor-performance
    // Actor: Admin / Procurement Officer
    // Vendor ratings, win rate (quotations won vs submitted), delivery trends
    @GetMapping("/vendor-performance")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<List<VendorPerformanceDto>> getVendorPerformance() {
        List<VendorPerformanceDto> performance = reportsService.getVendorPerformance();
        return ResponseEntity.ok(performance);
    }

    // GET /api/v1/reports/vendor-performance/{vendorId}
    // Actor: Admin / Procurement Officer — performance report for a single vendor
    @GetMapping("/vendor-performance/{vendorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<VendorPerformanceDto> getVendorPerformanceById(@PathVariable UUID vendorId) {
        VendorPerformanceDto performance = reportsService.getVendorPerformanceById(vendorId);
        return ResponseEntity.ok(performance);
    }

    // GET /api/v1/reports/rfq-trends
    // Actor: Admin / Procurement Officer
    // RFQ creation trends over time — monthly/weekly breakdown
    @GetMapping("/rfq-trends")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<Object> getRfqTrends(
            @RequestParam(required = false, defaultValue = "monthly") String groupBy,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Object trends = reportsService.getRfqTrends(groupBy, from, to);
        return ResponseEntity.ok(trends);
    }

    // GET /api/v1/reports/approval-stats
    // Actor: Admin / Manager
    // Approval turnaround time, approval vs rejection rates
    @GetMapping("/approval-stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Object> getApprovalStats() {
        Object stats = reportsService.getApprovalStats();
        return ResponseEntity.ok(stats);
    }
}
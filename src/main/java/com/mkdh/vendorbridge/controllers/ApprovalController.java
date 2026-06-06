package com.mkdh.vendorbridge.controllers;

import com.mkdh.vendorbridge.domain.dtos.ApprovalRequestDto;
import com.mkdh.vendorbridge.domain.dtos.ApprovalResponseDto;
import com.mkdh.vendorbridge.security.VendorBridgeUserDetails;
import com.mkdh.vendorbridge.services.ApprovalService;
import jakarta.validation.Valid;
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
@RequestMapping(path = "/api/v1/approval")
public class ApprovalController {

    private final ApprovalService approvalService;

    // POST /api/v1/approval/request/{quotationId}
    // Actor: Procurement Officer — send selected quotation for manager approval
    @PostMapping("/request/{quotationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<ApprovalResponseDto> requestApproval(
            @PathVariable UUID quotationId,
            @AuthenticationPrincipal VendorBridgeUserDetails userDetails) {
        ApprovalResponseDto approval = approvalService.requestApproval(quotationId, userDetails.getId());
        return ResponseEntity.ok(approval);
    }

    // POST /api/v1/approval/{approvalId}/approve
    // Actor: Manager/Approver — approve the procurement request
    // Remarks are optional but recommended (e.g. "Approved. Vendor B offers best value.")
    @PostMapping("/{approvalId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApprovalResponseDto> approveRequest(
            @PathVariable UUID approvalId,
            @Valid @RequestBody ApprovalRequestDto dto,
            @AuthenticationPrincipal VendorBridgeUserDetails userDetails) {
        ApprovalResponseDto approval = approvalService.approveRequest(approvalId, dto.getRemarks(), userDetails.getId());
        return ResponseEntity.ok(approval);
    }

    // POST /api/v1/approval/{approvalId}/reject
    // Actor: Manager/Approver — reject the procurement request with remarks
    @PostMapping("/{approvalId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApprovalResponseDto> rejectRequest(
            @PathVariable UUID approvalId,
            @Valid @RequestBody ApprovalRequestDto dto,
            @AuthenticationPrincipal VendorBridgeUserDetails userDetails) {
        ApprovalResponseDto approval = approvalService.rejectRequest(approvalId, dto.getRemarks(), userDetails.getId());
        return ResponseEntity.ok(approval);
    }

    // GET /api/v1/approval/pending
    // Actor: Manager — view all pending approval requests
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Page<ApprovalResponseDto>> getPendingApprovals(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<ApprovalResponseDto> approvals = approvalService.getPendingApprovals(pageable);
        return ResponseEntity.ok(approvals);
    }

    // GET /api/v1/approval/all
    // Actor: Admin — view all approvals regardless of status
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ApprovalResponseDto>> getAllApprovals(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<ApprovalResponseDto> approvals = approvalService.getAllApprovals(status, pageable);
        return ResponseEntity.ok(approvals);
    }

    // GET /api/v1/approval/{approvalId}
    // Get a single approval record by ID
    @GetMapping("/{approvalId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<ApprovalResponseDto> getApprovalById(@PathVariable UUID approvalId) {
        ApprovalResponseDto approval = approvalService.getApprovalById(approvalId);
        return ResponseEntity.ok(approval);
    }

    // GET /api/v1/approval/rfq/{rfqId}
    // Get approval record for a specific RFQ
    @GetMapping("/rfq/{rfqId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<ApprovalResponseDto> getApprovalByRfq(@PathVariable UUID rfqId) {
        ApprovalResponseDto approval = approvalService.getApprovalByRfq(rfqId);
        return ResponseEntity.ok(approval);
    }
}
package com.mkdh.vendorbridge.services;

import com.mkdh.vendorbridge.domain.dtos.ApprovalResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ApprovalService {

    ApprovalResponseDto requestApproval(UUID quotationId, UUID requestedByUserId);

    ApprovalResponseDto approveRequest(UUID approvalId, String remarks, UUID reviewedByUserId);

    ApprovalResponseDto rejectRequest(UUID approvalId, String remarks, UUID reviewedByUserId);

    Page<ApprovalResponseDto> getPendingApprovals(Pageable pageable);

    Page<ApprovalResponseDto> getAllApprovals(String status, Pageable pageable);

    ApprovalResponseDto getApprovalById(UUID approvalId);

    ApprovalResponseDto getApprovalByRfq(UUID rfqId);
}
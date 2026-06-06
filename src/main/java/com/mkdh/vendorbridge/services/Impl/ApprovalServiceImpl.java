package com.mkdh.vendorbridge.services.Impl;

import com.mkdh.vendorbridge.domain.dtos.ApprovalResponseDto;
import com.mkdh.vendorbridge.domain.entities.*;
import com.mkdh.vendorbridge.exceptions.ResourceNotFoundException;
import com.mkdh.vendorbridge.repositories.*;
import com.mkdh.vendorbridge.services.ActivityLogService;
import com.mkdh.vendorbridge.services.ApprovalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApprovalServiceImpl implements ApprovalService {

    private final ApprovalRepository approvalRepository;
    private final QuotationRepository quotationRepository;
    private final UserRepository userRepository;
    private final RfqRepository rfqRepository;
    private final ActivityLogService activityLogService;

    @Override
    @Transactional
    public ApprovalResponseDto requestApproval(UUID quotationId, UUID requestedByUserId) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found"));

        if (quotation.getStatus() != QuotationStatus.SELECTED) {
            throw new IllegalStateException("Only a SELECTED quotation can be sent for approval");
        }
        if (approvalRepository.existsByQuotationId(quotationId)) {
            throw new IllegalStateException("Approval request already exists for this quotation");
        }

        User requester = userRepository.findById(requestedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Approval approval = new Approval();
        approval.setQuotation(quotation);
        approval.setRfq(quotation.getRfq());
        approval.setRequestedBy(requester);
        approval.setStatus(ApprovalStatus.PENDING);

        Approval saved = approvalRepository.save(approval);

        activityLogService.log("APPROVAL", saved.getId(), "REQUESTED",
                "Approval requested for quotation from " + quotation.getVendor().getVendorName() +
                " | RFQ: " + quotation.getRfq().getTitle(),
                requester, null);

        log.info("Approval requested for quotation: {} by: {}", quotationId, requestedByUserId);
        return toResponseDto(saved);
    }

    @Override
    @Transactional
    public ApprovalResponseDto approveRequest(UUID approvalId, String remarks, UUID reviewedByUserId) {
        Approval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found"));

        if (approval.getStatus() != ApprovalStatus.PENDING) {
            throw new IllegalStateException("Only PENDING approvals can be approved");
        }

        User reviewer = userRepository.findById(reviewedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        approval.setStatus(ApprovalStatus.APPROVED);
        approval.setRemarks(remarks);
        approval.setReviewedBy(reviewer);
        approval.setReviewedAt(LocalDateTime.now());

        // Update RFQ status to APPROVED
        Rfq rfq = approval.getRfq();
        rfq.setStatus(RfqStatus.APPROVED);
        rfqRepository.save(rfq);

        Approval saved = approvalRepository.save(approval);

        activityLogService.log("APPROVAL", saved.getId(), "APPROVED",
                "Approved by " + reviewer.getUserName() +
                " | Remarks: " + (remarks != null ? remarks : "N/A"),
                reviewer, approval.getRequestedBy());

        log.info("Approval {} approved by: {}", approvalId, reviewedByUserId);
        return toResponseDto(saved);
    }

    @Override
    @Transactional
    public ApprovalResponseDto rejectRequest(UUID approvalId, String remarks, UUID reviewedByUserId) {
        if (remarks == null || remarks.isBlank()) {
            throw new IllegalArgumentException("Remarks are required when rejecting");
        }

        Approval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found"));

        if (approval.getStatus() != ApprovalStatus.PENDING) {
            throw new IllegalStateException("Only PENDING approvals can be rejected");
        }

        User reviewer = userRepository.findById(reviewedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        approval.setStatus(ApprovalStatus.REJECTED);
        approval.setRemarks(remarks);
        approval.setReviewedBy(reviewer);
        approval.setReviewedAt(LocalDateTime.now());

        // Revert RFQ to CLOSED so a new quotation can be selected
        Rfq rfq = approval.getRfq();
        rfq.setStatus(RfqStatus.CLOSED);
        rfqRepository.save(rfq);

        Approval saved = approvalRepository.save(approval);

        activityLogService.log("APPROVAL", saved.getId(), "REJECTED",
                "Rejected by " + reviewer.getUserName() + " | Reason: " + remarks,
                reviewer, approval.getRequestedBy());

        log.info("Approval {} rejected by: {}", approvalId, reviewedByUserId);
        return toResponseDto(saved);
    }

    @Override
    public Page<ApprovalResponseDto> getPendingApprovals(Pageable pageable) {
        return approvalRepository.findByStatus(ApprovalStatus.PENDING, pageable)
                .map(this::toResponseDto);
    }

    @Override
    public Page<ApprovalResponseDto> getAllApprovals(String status, Pageable pageable) {
        if (status != null && !status.isBlank()) {
            ApprovalStatus approvalStatus = ApprovalStatus.valueOf(status.toUpperCase());
            return approvalRepository.findByStatus(approvalStatus, pageable).map(this::toResponseDto);
        }
        return approvalRepository.findAll(pageable).map(this::toResponseDto);
    }

    @Override
    public ApprovalResponseDto getApprovalById(UUID approvalId) {
        return toResponseDto(approvalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found")));
    }

    @Override
    public ApprovalResponseDto getApprovalByRfq(UUID rfqId) {
        return toResponseDto(approvalRepository.findByRfqId(rfqId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found for RFQ: " + rfqId)));
    }

    private ApprovalResponseDto toResponseDto(Approval a) {
        Quotation q = a.getQuotation();
        return ApprovalResponseDto.builder()
                .id(a.getId())
                .rfqId(a.getRfq().getId())
                .rfqTitle(a.getRfq().getTitle())
                .quotationId(q.getId())
                .vendorName(q.getVendor().getVendorName())
                .pricePerUnit(q.getPricePerUnit())
                .totalAmount(q.getTotalAmount())
                .deliveryDays(q.getDeliveryDays())
                .requestedByUserName(a.getRequestedBy().getUserName())
                .reviewedByUserName(a.getReviewedBy() != null ? a.getReviewedBy().getUserName() : null)
                .status(a.getStatus().name())
                .remarks(a.getRemarks())
                .reviewedAt(a.getReviewedAt())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
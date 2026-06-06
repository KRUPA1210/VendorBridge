package com.mkdh.vendorbridge.services.Impl;

import com.mkdh.vendorbridge.Utils.PdfDocumentGenerator;
import com.mkdh.vendorbridge.domain.dtos.PurchaseOrderResponseDto;
import com.mkdh.vendorbridge.domain.entities.*;
import com.mkdh.vendorbridge.exceptions.ResourceNotFoundException;
import com.mkdh.vendorbridge.repositories.ApprovalRepository;
import com.mkdh.vendorbridge.repositories.PurchaseOrderRepository;
import com.mkdh.vendorbridge.repositories.UserRepository;
import com.mkdh.vendorbridge.repositories.VendorRepository;
import com.mkdh.vendorbridge.services.ActivityLogService;
import com.mkdh.vendorbridge.services.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ApprovalRepository approvalRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ActivityLogService activityLogService;
    private final PdfDocumentGenerator pdfDocumentGenerator;

    @Override
    @Transactional
    public PurchaseOrderResponseDto generatePurchaseOrder(UUID approvalId, UUID createdByUserId) {
        Approval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found"));

        if (approval.getStatus() != ApprovalStatus.APPROVED) {
            throw new IllegalStateException("Purchase order can only be generated from APPROVED approvals");
        }
        if (purchaseOrderRepository.findByApprovalId(approvalId).isPresent()) {
            throw new IllegalStateException("Purchase order already exists for this approval");
        }

        User creator = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Quotation quotation = approval.getQuotation();
        Rfq rfq = approval.getRfq();
        Vendor vendor = quotation.getVendor();

        PurchaseOrder purchaseOrder = new PurchaseOrder();
        purchaseOrder.setPoNumber(generatePoNumber());
        purchaseOrder.setApproval(approval);
        purchaseOrder.setVendor(vendor);
        purchaseOrder.setRfq(rfq);
        purchaseOrder.setItemDescription(rfq.getProductService() +
                (rfq.getDescription() != null ? " - " + rfq.getDescription() : ""));
        purchaseOrder.setQuantity(rfq.getQuantity());
        purchaseOrder.setUnitPrice(quotation.getPricePerUnit());
        purchaseOrder.setTotalAmount(quotation.getTotalAmount());
        purchaseOrder.setStatus(PurchaseOrderStatus.DRAFT);
        purchaseOrder.setCreatedBy(creator);

        PurchaseOrder saved = purchaseOrderRepository.save(purchaseOrder);

        activityLogService.log("PURCHASE_ORDER", saved.getId(), "CREATED",
                "Purchase order " + saved.getPoNumber() + " generated for vendor " + vendor.getVendorName(),
                creator, userRepository.findByEmail(vendor.getEmail()).orElse(null));

        log.info("Purchase order {} generated from approval {}", saved.getPoNumber(), approvalId);
        return toResponseDto(saved);
    }

    @Override
    public Page<PurchaseOrderResponseDto> getAllPurchaseOrders(String status, Pageable pageable) {
        if (status != null && !status.isBlank()) {
            PurchaseOrderStatus poStatus = PurchaseOrderStatus.valueOf(status.toUpperCase());
            return purchaseOrderRepository.findByStatus(poStatus, pageable).map(this::toResponseDto);
        }
        return purchaseOrderRepository.findAll(pageable).map(this::toResponseDto);
    }

    @Override
    public PurchaseOrderResponseDto getPurchaseOrderById(UUID poId) {
        return toResponseDto(findPurchaseOrder(poId));
    }

    @Override
    public List<PurchaseOrderResponseDto> getPurchaseOrdersByVendor(UUID vendorUserId) {
        User vendorUser = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Vendor vendor = vendorRepository.findByEmail(vendorUser.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));

        return purchaseOrderRepository.findByVendorId(vendor.getId()).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PurchaseOrderResponseDto sendPurchaseOrder(UUID poId) {
        PurchaseOrder purchaseOrder = findPurchaseOrder(poId);

        if (purchaseOrder.getStatus() == PurchaseOrderStatus.SENT) {
            throw new IllegalStateException("Purchase order has already been sent");
        }

        purchaseOrder.setStatus(PurchaseOrderStatus.SENT);
        purchaseOrder.setSentAt(LocalDateTime.now());
        PurchaseOrder saved = purchaseOrderRepository.save(purchaseOrder);

        User vendorUser = userRepository.findByEmail(saved.getVendor().getEmail()).orElse(null);
        activityLogService.log("PURCHASE_ORDER", saved.getId(), "SENT",
                "Purchase order " + saved.getPoNumber() + " sent to vendor " + saved.getVendor().getVendorName(),
                saved.getCreatedBy(), vendorUser);

        return toResponseDto(saved);
    }

    @Override
    public byte[] generatePdf(UUID poId) {
        PurchaseOrder po = findPurchaseOrder(poId);
        return pdfDocumentGenerator.generatePurchaseOrderPdf(
                po.getPoNumber(),
                po.getVendor().getVendorName(),
                po.getVendor().getEmail(),
                po.getVendor().getGstNumber(),
                po.getVendor().getAddress(),
                po.getRfq().getTitle(),
                po.getItemDescription(),
                po.getQuantity(),
                po.getUnitPrice(),
                po.getTotalAmount(),
                po.getStatus().name(),
                po.getCreatedBy().getUserName(),
                po.getCreatedAt()
        );
    }

    private PurchaseOrder findPurchaseOrder(UUID poId) {
        return purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found"));
    }

    private String generatePoNumber() {
        int year = LocalDate.now().getYear();
        String prefix = "PO-" + year + "-";
        long count = purchaseOrderRepository.countByPoNumberStartingWith(prefix);
        return prefix + String.format("%03d", count + 1);
    }

    private PurchaseOrderResponseDto toResponseDto(PurchaseOrder po) {
        Vendor vendor = po.getVendor();
        return PurchaseOrderResponseDto.builder()
                .id(po.getId())
                .poNumber(po.getPoNumber())
                .rfqId(po.getRfq().getId())
                .rfqTitle(po.getRfq().getTitle())
                .vendorId(vendor.getId())
                .vendorName(vendor.getVendorName())
                .vendorEmail(vendor.getEmail())
                .vendorGstNumber(vendor.getGstNumber())
                .vendorAddress(vendor.getAddress())
                .itemDescription(po.getItemDescription())
                .quantity(po.getQuantity())
                .unitPrice(po.getUnitPrice())
                .totalAmount(po.getTotalAmount())
                .status(po.getStatus().name())
                .createdByUserName(po.getCreatedBy().getUserName())
                .sentAt(po.getSentAt())
                .createdAt(po.getCreatedAt())
                .updatedAt(po.getUpdatedAt())
                .build();
    }
}

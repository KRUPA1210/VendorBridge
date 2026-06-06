package com.mkdh.vendorbridge.services.Impl;

import com.mkdh.vendorbridge.domain.dtos.CreateRfqRequestDto;
import com.mkdh.vendorbridge.domain.dtos.RfqResponseDto;
import com.mkdh.vendorbridge.domain.dtos.VendorSummaryDto;
import com.mkdh.vendorbridge.domain.entities.*;
import com.mkdh.vendorbridge.exceptions.ResourceNotFoundException;
import com.mkdh.vendorbridge.repositories.RfqRepository;
import com.mkdh.vendorbridge.repositories.UserRepository;
import com.mkdh.vendorbridge.repositories.VendorRepository;
import com.mkdh.vendorbridge.services.ActivityLogService;
import com.mkdh.vendorbridge.services.RfqService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RfqServiceImpl implements RfqService {

    private final RfqRepository rfqRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ActivityLogService activityLogService;

    @Override
    @Transactional
    public RfqResponseDto createRfq(CreateRfqRequestDto dto, UUID createdByUserId) {
        User creator = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Set<Vendor> vendors = new HashSet<>(vendorRepository.findAllById(dto.getVendorIds()));
        if (vendors.isEmpty()) {
            throw new IllegalArgumentException("No valid vendors found for provided IDs");
        }

        Rfq rfq = new Rfq();
        rfq.setTitle(dto.getTitle());
        rfq.setDescription(dto.getDescription());
        rfq.setProductService(dto.getProductService());
        rfq.setQuantity(dto.getQuantity());
        rfq.setUnit(dto.getUnit());
        rfq.setDeadline(dto.getDeadline());
        rfq.setAttachments(dto.getAttachments());
        rfq.setStatus(RfqStatus.OPEN);
        rfq.setCreatedBy(creator);
        rfq.setAssignedVendors(vendors);

        Rfq saved = rfqRepository.save(rfq);

        // Log + notify each assigned vendor
        vendors.forEach(vendor -> {
            User vendorUser = userRepository.findByEmail(vendor.getEmail()).orElse(null);
            activityLogService.log("RFQ", saved.getId(), "CREATED",
                    "RFQ '" + saved.getTitle() + "' created and assigned to vendor: " + vendor.getVendorName(),
                    creator, vendorUser);
        });

        log.info("RFQ created: {} by user: {}", saved.getId(), createdByUserId);
        return toResponseDto(saved);
    }

    @Override
    public Page<RfqResponseDto> getAllRfqs(String status, Pageable pageable) {
        Page<Rfq> rfqs;
        if (status != null && !status.isBlank()) {
            RfqStatus rfqStatus = RfqStatus.valueOf(status.toUpperCase());
            rfqs = rfqRepository.findByStatus(rfqStatus, pageable);
        } else {
            rfqs = rfqRepository.findAll(pageable);
        }
        return rfqs.map(this::toResponseDto);
    }

    @Override
    public RfqResponseDto getRfqById(UUID rfqId) {
        Rfq rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new ResourceNotFoundException("RFQ not found with id: " + rfqId));
        return toResponseDto(rfq);
    }

    @Override
    public List<RfqResponseDto> getRfqsForVendor(UUID vendorUserId) {
        // Vendor user's email maps to a Vendor record
        User vendorUser = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Vendor vendor = vendorRepository.findByEmail(vendorUser.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found for this user"));

        return rfqRepository.findByAssignedVendorId(vendor.getId())
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RfqResponseDto updateRfq(UUID rfqId, CreateRfqRequestDto dto, UUID updatedByUserId) {
        Rfq rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new ResourceNotFoundException("RFQ not found with id: " + rfqId));

        if (rfq.getStatus() != RfqStatus.OPEN) {
            throw new IllegalStateException("Only OPEN RFQs can be updated");
        }

        Set<Vendor> vendors = new HashSet<>(vendorRepository.findAllById(dto.getVendorIds()));

        rfq.setTitle(dto.getTitle());
        rfq.setDescription(dto.getDescription());
        rfq.setProductService(dto.getProductService());
        rfq.setQuantity(dto.getQuantity());
        rfq.setUnit(dto.getUnit());
        rfq.setDeadline(dto.getDeadline());
        rfq.setAttachments(dto.getAttachments());
        rfq.setAssignedVendors(vendors);

        return toResponseDto(rfqRepository.save(rfq));
    }

    @Override
    public void deleteRfq(UUID rfqId) {
        Rfq rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new ResourceNotFoundException("RFQ not found with id: " + rfqId));
        rfqRepository.delete(rfq);
    }

    @Override
    @Transactional
    public RfqResponseDto closeRfq(UUID rfqId) {
        Rfq rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new ResourceNotFoundException("RFQ not found with id: " + rfqId));

        if (rfq.getStatus() != RfqStatus.OPEN) {
            throw new IllegalStateException("Only OPEN RFQs can be closed");
        }

        rfq.setStatus(RfqStatus.CLOSED);
        Rfq saved = rfqRepository.save(rfq);

        activityLogService.log("RFQ", saved.getId(), "CLOSED",
                "RFQ '" + saved.getTitle() + "' has been closed", null, null);

        return toResponseDto(saved);
    }

    private RfqResponseDto toResponseDto(Rfq rfq) {
        Set<VendorSummaryDto> vendorDtos = rfq.getAssignedVendors().stream()
                .map(v -> VendorSummaryDto.builder()
                        .id(v.getId())
                        .vendorName(v.getVendorName())
                        .email(v.getEmail())
                        .phoneNo(v.getPhoneNo())
                        .gstNumber(v.getGstNumber())
                        .rating(v.getRating())
                        .build())
                .collect(Collectors.toSet());

        return RfqResponseDto.builder()
                .id(rfq.getId())
                .title(rfq.getTitle())
                .description(rfq.getDescription())
                .productService(rfq.getProductService())
                .quantity(rfq.getQuantity())
                .unit(rfq.getUnit())
                .deadline(rfq.getDeadline())
                .attachments(rfq.getAttachments())
                .status(rfq.getStatus().name())
                .createdByUserName(rfq.getCreatedBy().getUserName())
                .assignedVendors(vendorDtos)
                .totalQuotationsReceived(rfq.getQuotations().size())
                .createdAt(rfq.getCreatedAt())
                .updatedAt(rfq.getUpdatedAt())
                .build();
    }
}
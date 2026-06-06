package com.mkdh.vendorbridge.services.Impl;

import com.mkdh.vendorbridge.domain.dtos.QuotationComparisonDto;
import com.mkdh.vendorbridge.domain.dtos.QuotationRequestDto;
import com.mkdh.vendorbridge.domain.dtos.QuotationResponseDto;
import com.mkdh.vendorbridge.domain.entities.*;
import com.mkdh.vendorbridge.exceptions.ResourceNotFoundException;
import com.mkdh.vendorbridge.repositories.*;
import com.mkdh.vendorbridge.services.ActivityLogService;
import com.mkdh.vendorbridge.services.QuotationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuotationServiceImpl implements QuotationService {

    private final QuotationRepository quotationRepository;
    private final RfqRepository rfqRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    @Override
    @Transactional
    public QuotationResponseDto submitQuotation(UUID rfqId, QuotationRequestDto dto, UUID vendorUserId) {
        Rfq rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new ResourceNotFoundException("RFQ not found"));

        if (rfq.getStatus() != RfqStatus.OPEN) {
            throw new IllegalStateException("This RFQ is no longer accepting quotations");
        }
        if (rfq.getDeadline().isBefore(LocalDate.now())) {
            throw new IllegalStateException("RFQ deadline has passed");
        }

        // Map vendor user → vendor profile
        User vendorUser = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Vendor vendor = vendorRepository.findByEmail(vendorUser.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found for this user"));

        // Verify vendor is assigned to this RFQ
        boolean isAssigned = rfq.getAssignedVendors().stream()
                .anyMatch(v -> v.getId().equals(vendor.getId()));
        if (!isAssigned) {
            throw new IllegalStateException("You are not assigned to this RFQ");
        }

        if (quotationRepository.existsByRfqIdAndVendorId(rfqId, vendor.getId())) {
            throw new IllegalStateException("You have already submitted a quotation for this RFQ. Use edit instead.");
        }

        BigDecimal totalAmount = dto.getPricePerUnit()
                .multiply(BigDecimal.valueOf(rfq.getQuantity()));

        Quotation quotation = new Quotation();
        quotation.setRfq(rfq);
        quotation.setVendor(vendor);
        quotation.setPricePerUnit(dto.getPricePerUnit());
        quotation.setTotalAmount(totalAmount);
        quotation.setDeliveryDays(dto.getDeliveryDays());
        quotation.setNotes(dto.getNotes());
        quotation.setStatus(QuotationStatus.SUBMITTED);
        quotation.setIsBestPrice(false);

        Quotation saved = quotationRepository.save(quotation);

        activityLogService.log("QUOTATION", saved.getId(), "SUBMITTED",
                "Vendor " + vendor.getVendorName() + " submitted quotation for RFQ: " + rfq.getTitle(),
                vendorUser, rfq.getCreatedBy());

        log.info("Quotation submitted by vendor: {} for RFQ: {}", vendor.getId(), rfqId);
        return toResponseDto(saved);
    }

    @Override
    @Transactional
    public QuotationResponseDto editQuotation(UUID quotationId, QuotationRequestDto dto, UUID vendorUserId) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found"));

        User vendorUser = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Vendor vendor = vendorRepository.findByEmail(vendorUser.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));

        if (!quotation.getVendor().getId().equals(vendor.getId())) {
            throw new IllegalStateException("You can only edit your own quotations");
        }
        if (quotation.getStatus() != QuotationStatus.SUBMITTED) {
            throw new IllegalStateException("Only SUBMITTED quotations can be edited");
        }
        if (quotation.getRfq().getDeadline().isBefore(LocalDate.now())) {
            throw new IllegalStateException("RFQ deadline has passed, quotation cannot be edited");
        }

        BigDecimal totalAmount = dto.getPricePerUnit()
                .multiply(BigDecimal.valueOf(quotation.getRfq().getQuantity()));

        quotation.setPricePerUnit(dto.getPricePerUnit());
        quotation.setTotalAmount(totalAmount);
        quotation.setDeliveryDays(dto.getDeliveryDays());
        quotation.setNotes(dto.getNotes());

        return toResponseDto(quotationRepository.save(quotation));
    }

    @Override
    public List<QuotationResponseDto> getQuotationsByRfq(UUID rfqId) {
        return quotationRepository.findByRfqId(rfqId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public QuotationComparisonDto compareQuotations(UUID rfqId) {
        Rfq rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new ResourceNotFoundException("RFQ not found"));

        // Sorted by pricePerUnit ASC — cheapest first
        List<Quotation> sorted = quotationRepository.findByRfqIdOrderByPriceAsc(rfqId);
        if (sorted.isEmpty()) {
            throw new IllegalStateException("No quotations received for this RFQ yet");
        }

        // Mark best price on the first (cheapest) entry
        Quotation best = sorted.get(0);

        // Find fastest delivery
        int fastestDelivery = sorted.stream()
                .mapToInt(Quotation::getDeliveryDays)
                .min()
                .orElse(0);

        List<QuotationComparisonDto.QuotationComparisonItemDto> items = sorted.stream()
                .map(q -> QuotationComparisonDto.QuotationComparisonItemDto.builder()
                        .quotationId(q.getId())
                        .vendorId(q.getVendor().getId())
                        .vendorName(q.getVendor().getVendorName())
                        .vendorRating(q.getVendor().getRating())
                        .pricePerUnit(q.getPricePerUnit())
                        .totalAmount(q.getTotalAmount())
                        .deliveryDays(q.getDeliveryDays())
                        .notes(q.getNotes())
                        .status(q.getStatus().name())
                        .isBestPrice(q.getId().equals(best.getId()))
                        .build())
                .collect(Collectors.toList());

        return QuotationComparisonDto.builder()
                .rfqId(rfq.getId())
                .rfqTitle(rfq.getTitle())
                .productService(rfq.getProductService())
                .quantity(rfq.getQuantity())
                .quotations(items)
                .bestPriceQuotationId(best.getId())
                .bestPricePerUnit(best.getPricePerUnit())
                .fastestDeliveryDays(fastestDelivery)
                .build();
    }

    @Override
    public List<QuotationResponseDto> getQuotationsByVendor(UUID vendorUserId) {
        User vendorUser = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Vendor vendor = vendorRepository.findByEmail(vendorUser.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));

        return quotationRepository.findByVendorId(vendor.getId()).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public QuotationResponseDto getQuotationById(UUID quotationId) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found"));
        return toResponseDto(quotation);
    }

    @Override
    @Transactional
    public QuotationResponseDto selectQuotation(UUID quotationId, UUID selectedByUserId) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found"));

        if (quotation.getStatus() != QuotationStatus.SUBMITTED) {
            throw new IllegalStateException("Only SUBMITTED quotations can be selected");
        }

        User selector = userRepository.findById(selectedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Mark all others as REJECTED
        List<Quotation> allForRfq = quotationRepository.findByRfqId(quotation.getRfq().getId());
        allForRfq.forEach(q -> {
            if (!q.getId().equals(quotationId)) {
                q.setStatus(QuotationStatus.REJECTED);
                q.setIsBestPrice(false);
            }
        });
        quotationRepository.saveAll(allForRfq);

        // Mark selected
        quotation.setStatus(QuotationStatus.SELECTED);
        quotation.setIsBestPrice(true);

        // Update RFQ status
        Rfq rfq = quotation.getRfq();
        rfq.setStatus(RfqStatus.AWARDED);
        rfqRepository.save(rfq);

        Quotation saved = quotationRepository.save(quotation);

        activityLogService.log("QUOTATION", saved.getId(), "SELECTED",
                "Quotation from " + quotation.getVendor().getVendorName() +
                " selected for RFQ: " + rfq.getTitle(),
                selector, null);

        return toResponseDto(saved);
    }

    private QuotationResponseDto toResponseDto(Quotation q) {
        return QuotationResponseDto.builder()
                .id(q.getId())
                .rfqId(q.getRfq().getId())
                .rfqTitle(q.getRfq().getTitle())
                .vendorId(q.getVendor().getId())
                .vendorName(q.getVendor().getVendorName())
                .pricePerUnit(q.getPricePerUnit())
                .totalAmount(q.getTotalAmount())
                .deliveryDays(q.getDeliveryDays())
                .notes(q.getNotes())
                .status(q.getStatus().name())
                .isBestPrice(q.getIsBestPrice())
                .createdAt(q.getCreatedAt())
                .updatedAt(q.getUpdatedAt())
                .build();
    }
}
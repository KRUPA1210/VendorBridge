package com.mkdh.vendorbridge.services;

import com.mkdh.vendorbridge.domain.dtos.QuotationComparisonDto;
import com.mkdh.vendorbridge.domain.dtos.QuotationRequestDto;
import com.mkdh.vendorbridge.domain.dtos.QuotationResponseDto;

import java.util.List;
import java.util.UUID;

public interface QuotationService {

    QuotationResponseDto submitQuotation(UUID rfqId, QuotationRequestDto dto, UUID vendorUserId);

    QuotationResponseDto editQuotation(UUID quotationId, QuotationRequestDto dto, UUID vendorUserId);

    List<QuotationResponseDto> getQuotationsByRfq(UUID rfqId);

    QuotationComparisonDto compareQuotations(UUID rfqId);

    List<QuotationResponseDto> getQuotationsByVendor(UUID vendorUserId);

    QuotationResponseDto getQuotationById(UUID quotationId);

    QuotationResponseDto selectQuotation(UUID quotationId, UUID selectedByUserId);
}
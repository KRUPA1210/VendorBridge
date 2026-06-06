package com.mkdh.vendorbridge.services;

import com.mkdh.vendorbridge.domain.dtos.SpendingSummaryDto;
import com.mkdh.vendorbridge.domain.dtos.VendorPerformanceDto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ReportsService {

    SpendingSummaryDto getSpendingSummary(LocalDate from, LocalDate to);

    List<VendorPerformanceDto> getVendorPerformance();

    VendorPerformanceDto getVendorPerformanceById(UUID vendorId);

    Object getRfqTrends(String groupBy, LocalDate from, LocalDate to);

    Object getApprovalStats();
}
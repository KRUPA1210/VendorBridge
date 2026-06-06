package com.mkdh.vendorbridge.domain.dtos;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VendorPerformanceDto {

    private UUID vendorId;
    private String vendorName;
    private String email;
    private Integer rating;

    private Integer totalRfqsAssigned;
    private Integer totalQuotationsSubmitted;
    private Integer totalQuotationsWon;         // selected + PO generated

    // Win rate: quotationsWon / quotationsSubmitted × 100
    private Double winRatePercent;

    private BigDecimal totalBusinessValue;      // sum of all won PO amounts
    private Double averageDeliveryDays;
}
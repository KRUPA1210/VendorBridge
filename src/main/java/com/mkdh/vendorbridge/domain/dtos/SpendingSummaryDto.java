package com.mkdh.vendorbridge.domain.dtos;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SpendingSummaryDto {

    private LocalDate from;
    private LocalDate to;

    private Integer totalRfqs;
    private Integer totalPurchaseOrders;
    private Integer totalInvoices;

    private BigDecimal totalSubtotal;
    private BigDecimal totalGstAmount;
    private BigDecimal totalGrandTotal;

    private BigDecimal averageOrderValue;
    private String topVendorName;           // vendor with most business
    private BigDecimal topVendorValue;
}
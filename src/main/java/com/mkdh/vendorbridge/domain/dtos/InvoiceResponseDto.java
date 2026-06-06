package com.mkdh.vendorbridge.domain.dtos;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InvoiceResponseDto {

    private UUID id;
    private String invoiceNumber;           // e.g. INV-2026-001

    private UUID purchaseOrderId;
    private String poNumber;

    private UUID vendorId;
    private String vendorName;
    private String vendorEmail;
    private String vendorGstNumber;

    private String itemDescription;
    private Integer quantity;
    private BigDecimal unitPrice;

    private BigDecimal subtotal;
    private BigDecimal gstRate;             // e.g. 18.00
    private BigDecimal gstAmount;
    private BigDecimal grandTotal;

    private String generatedByUserName;
    private LocalDateTime emailedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
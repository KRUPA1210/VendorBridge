package com.mkdh.vendorbridge.domain.dtos;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PurchaseOrderResponseDto {

    private UUID id;
    private String poNumber;               // e.g. PO-2026-001

    private UUID rfqId;
    private String rfqTitle;

    private UUID vendorId;
    private String vendorName;
    private String vendorEmail;
    private String vendorGstNumber;
    private String vendorAddress;

    private String itemDescription;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;

    private String status;                 // PurchaseOrderStatus as string
    private String createdByUserName;

    private LocalDateTime sentAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
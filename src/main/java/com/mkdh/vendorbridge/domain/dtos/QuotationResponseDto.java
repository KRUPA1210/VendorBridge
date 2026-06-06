package com.mkdh.vendorbridge.domain.dtos;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuotationResponseDto {

    private UUID id;

    private UUID rfqId;
    private String rfqTitle;

    private UUID vendorId;
    private String vendorName;

    private BigDecimal pricePerUnit;
    private BigDecimal totalAmount;
    private Integer deliveryDays;
    private String notes;

    private String status;                  // QuotationStatus as string
    private Boolean isBestPrice;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
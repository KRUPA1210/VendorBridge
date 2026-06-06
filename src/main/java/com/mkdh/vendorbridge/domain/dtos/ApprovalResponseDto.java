package com.mkdh.vendorbridge.domain.dtos;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApprovalResponseDto {

    private UUID id;

    private UUID rfqId;
    private String rfqTitle;

    private UUID quotationId;
    private String vendorName;
    private BigDecimal pricePerUnit;
    private BigDecimal totalAmount;
    private Integer deliveryDays;

    private String requestedByUserName;
    private String reviewedByUserName;

    private String status;                  // ApprovalStatus as string
    private String remarks;

    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
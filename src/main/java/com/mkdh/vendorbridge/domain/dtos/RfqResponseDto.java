package com.mkdh.vendorbridge.domain.dtos;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RfqResponseDto {

    private UUID id;
    private String title;
    private String description;
    private String productService;
    private Integer quantity;
    private String unit;
    private LocalDate deadline;
    private String attachments;
    private String status;                      // RfqStatus as string

    private String createdByUserName;           // Procurement Officer
    private Set<VendorSummaryDto> assignedVendors;

    private Integer totalQuotationsReceived;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
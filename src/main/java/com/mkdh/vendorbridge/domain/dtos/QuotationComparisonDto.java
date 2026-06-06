package com.mkdh.vendorbridge.domain.dtos;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuotationComparisonDto {

    private UUID rfqId;
    private String rfqTitle;
    private String productService;
    private Integer quantity;

    // Sorted by pricePerUnit ascending; first entry = best price
    private List<QuotationComparisonItemDto> quotations;

    private UUID bestPriceQuotationId;
    private BigDecimal bestPricePerUnit;
    private Integer fastestDeliveryDays;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class QuotationComparisonItemDto {
        private UUID quotationId;
        private UUID vendorId;
        private String vendorName;
        private Integer vendorRating;
        private BigDecimal pricePerUnit;
        private BigDecimal totalAmount;
        private Integer deliveryDays;
        private String notes;
        private String status;
        private Boolean isBestPrice;
    }
}
package com.mkdh.vendorbridge.domain.dtos;

import lombok.*;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VendorSummaryDto {
    private UUID id;
    private String vendorName;
    private String email;
    private String phoneNo;
    private String gstNumber;
    private Integer rating;
}
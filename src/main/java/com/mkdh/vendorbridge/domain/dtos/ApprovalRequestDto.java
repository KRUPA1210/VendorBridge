package com.mkdh.vendorbridge.domain.dtos;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApprovalRequestDto {
    // Remarks are optional for approve, required (enforced in service) for reject
    private String remarks;
}
package com.mkdh.vendorbridge.domain.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateVendorResponseDto {
    private String vendorName;
    private String email;
    private String phoneNo;
    private String gstNumber;
    private String address;
}

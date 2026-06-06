package com.mkdh.vendorbridge.domain;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateVendorRequest {
    private String vendorName;
    private String email;
    private String phoneNo;
    private String gstNumber;
    private String address;
}

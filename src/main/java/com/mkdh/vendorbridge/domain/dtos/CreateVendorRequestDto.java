package com.mkdh.vendorbridge.domain.dtos;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateVendorRequestDto {

    @NotBlank(message = "Vendor name is required")
    private String vendorName;

    @Email(message = "Invalid email")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Phone Number is required")
    private String phoneNo;

    @NotBlank(message = "GST Number is required")
    private String gstNumber;

    @NotBlank(message = "Address is required")
    private String address;


}

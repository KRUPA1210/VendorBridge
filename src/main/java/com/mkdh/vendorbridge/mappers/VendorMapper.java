package com.mkdh.vendorbridge.mappers;

import com.mkdh.vendorbridge.domain.CreateVendorRequest;
import com.mkdh.vendorbridge.domain.dtos.CreateVendorResponseDto;
import com.mkdh.vendorbridge.domain.entities.Vendor;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface VendorMapper {

    Vendor toEntity(CreateVendorRequest request);

    CreateVendorResponseDto toResponse(Vendor vendor);
}


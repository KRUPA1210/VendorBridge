package com.mkdh.vendorbridge.services;

import com.mkdh.vendorbridge.domain.dtos.CreateRfqRequestDto;
import com.mkdh.vendorbridge.domain.dtos.RfqResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface RfqService {

    RfqResponseDto createRfq(CreateRfqRequestDto dto, UUID createdByUserId);

    Page<RfqResponseDto> getAllRfqs(String status, Pageable pageable);

    RfqResponseDto getRfqById(UUID rfqId);

    List<RfqResponseDto> getRfqsForVendor(UUID vendorId);

    RfqResponseDto updateRfq(UUID rfqId, CreateRfqRequestDto dto, UUID updatedByUserId);

    void deleteRfq(UUID rfqId);

    RfqResponseDto closeRfq(UUID rfqId);
}
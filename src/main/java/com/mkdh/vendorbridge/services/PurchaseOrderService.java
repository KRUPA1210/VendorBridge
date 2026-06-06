package com.mkdh.vendorbridge.services;

import com.mkdh.vendorbridge.domain.dtos.PurchaseOrderResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface PurchaseOrderService {

    PurchaseOrderResponseDto generatePurchaseOrder(UUID approvalId, UUID createdByUserId);

    Page<PurchaseOrderResponseDto> getAllPurchaseOrders(String status, Pageable pageable);

    PurchaseOrderResponseDto getPurchaseOrderById(UUID poId);

    List<PurchaseOrderResponseDto> getPurchaseOrdersByVendor(UUID vendorUserId);

    PurchaseOrderResponseDto sendPurchaseOrder(UUID poId);

    byte[] generatePdf(UUID poId);
}
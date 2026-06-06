package com.mkdh.vendorbridge.services;

import com.mkdh.vendorbridge.domain.dtos.InvoiceResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface InvoiceService {

    InvoiceResponseDto generateInvoice(UUID poId, UUID generatedByUserId);

    Page<InvoiceResponseDto> getAllInvoices(Pageable pageable);

    InvoiceResponseDto getInvoiceById(UUID invoiceId);

    InvoiceResponseDto getInvoiceByPurchaseOrderId(UUID poId);

    byte[] generatePdf(UUID invoiceId);

    void emailInvoiceToVendor(UUID invoiceId);

    Page<InvoiceResponseDto> getInvoicesByVendor(UUID vendorUserId, Pageable pageable);
}
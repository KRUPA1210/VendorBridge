package com.mkdh.vendorbridge.services.Impl;

import com.mkdh.vendorbridge.Utils.EmailUtils;
import com.mkdh.vendorbridge.Utils.PdfDocumentGenerator;
import com.mkdh.vendorbridge.domain.dtos.InvoiceResponseDto;
import com.mkdh.vendorbridge.domain.entities.*;
import com.mkdh.vendorbridge.exceptions.ResourceNotFoundException;
import com.mkdh.vendorbridge.repositories.InvoiceRepository;
import com.mkdh.vendorbridge.repositories.PurchaseOrderRepository;
import com.mkdh.vendorbridge.repositories.UserRepository;
import com.mkdh.vendorbridge.repositories.VendorRepository;
import com.mkdh.vendorbridge.services.ActivityLogService;
import com.mkdh.vendorbridge.services.InvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private static final BigDecimal DEFAULT_GST_RATE = new BigDecimal("18.00");

    private final InvoiceRepository invoiceRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ActivityLogService activityLogService;
    private final EmailUtils emailUtils;
    private final PdfDocumentGenerator pdfDocumentGenerator;

    @Value("${email.from}")
    private String fromEmail;

    @Override
    @Transactional
    public InvoiceResponseDto generateInvoice(UUID poId, UUID generatedByUserId) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found"));

        if (invoiceRepository.findByPurchaseOrderId(poId).isPresent()) {
            throw new IllegalStateException("Invoice already exists for this purchase order");
        }

        User generator = userRepository.findById(generatedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BigDecimal subtotal = purchaseOrder.getTotalAmount();
        BigDecimal gstAmount = subtotal.multiply(DEFAULT_GST_RATE)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = subtotal.add(gstAmount);

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setPurchaseOrder(purchaseOrder);
        invoice.setVendor(purchaseOrder.getVendor());
        invoice.setItemDescription(purchaseOrder.getItemDescription());
        invoice.setQuantity(purchaseOrder.getQuantity());
        invoice.setUnitPrice(purchaseOrder.getUnitPrice());
        invoice.setSubtotal(subtotal);
        invoice.setGstRate(DEFAULT_GST_RATE);
        invoice.setGstAmount(gstAmount);
        invoice.setGrandTotal(grandTotal);
        invoice.setGeneratedBy(generator);

        Invoice saved = invoiceRepository.save(invoice);

        User vendorUser = userRepository.findByEmail(saved.getVendor().getEmail()).orElse(null);
        activityLogService.log("INVOICE", saved.getId(), "GENERATED",
                "Invoice " + saved.getInvoiceNumber() + " generated for PO " + purchaseOrder.getPoNumber(),
                generator, vendorUser);

        log.info("Invoice {} generated for PO {}", saved.getInvoiceNumber(), poId);
        return toResponseDto(saved);
    }

    @Override
    public Page<InvoiceResponseDto> getAllInvoices(Pageable pageable) {
        return invoiceRepository.findAll(pageable).map(this::toResponseDto);
    }

    @Override
    public InvoiceResponseDto getInvoiceById(UUID invoiceId) {
        return toResponseDto(findInvoice(invoiceId));
    }

    @Override
    public InvoiceResponseDto getInvoiceByPurchaseOrderId(UUID poId) {
        return toResponseDto(invoiceRepository.findByPurchaseOrderId(poId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found for purchase order")));
    }

    @Override
    public byte[] generatePdf(UUID invoiceId) {
        Invoice invoice = findInvoice(invoiceId);
        return pdfDocumentGenerator.generateInvoicePdf(
                invoice.getInvoiceNumber(),
                invoice.getPurchaseOrder().getPoNumber(),
                invoice.getVendor().getVendorName(),
                invoice.getVendor().getEmail(),
                invoice.getVendor().getGstNumber(),
                invoice.getItemDescription(),
                invoice.getQuantity(),
                invoice.getUnitPrice(),
                invoice.getSubtotal(),
                invoice.getGstRate(),
                invoice.getGstAmount(),
                invoice.getGrandTotal(),
                invoice.getGeneratedBy().getUserName(),
                invoice.getCreatedAt()
        );
    }

    @Override
    @Transactional
    public void emailInvoiceToVendor(UUID invoiceId) {
        Invoice invoice = findInvoice(invoiceId);
        Vendor vendor = invoice.getVendor();

        String subject = "Invoice " + invoice.getInvoiceNumber();
        String htmlBody = """
                <h1>Invoice %s</h1>
                <p>Dear %s,</p>
                <p>Please find your invoice details below:</p>
                <ul>
                    <li><strong>PO Number:</strong> %s</li>
                    <li><strong>Subtotal:</strong> INR %s</li>
                    <li><strong>GST (%s%%):</strong> INR %s</li>
                    <li><strong>Grand Total:</strong> INR %s</li>
                </ul>
                <p>Thank you for your business.</p>
                """.formatted(
                invoice.getInvoiceNumber(),
                vendor.getVendorName(),
                invoice.getPurchaseOrder().getPoNumber(),
                invoice.getSubtotal(),
                invoice.getGstRate(),
                invoice.getGstAmount(),
                invoice.getGrandTotal()
        );

        emailUtils.sendEmail(fromEmail, vendor.getEmail(), subject, htmlBody);
        invoice.setEmailedAt(LocalDateTime.now());
        invoiceRepository.save(invoice);

        User vendorUser = userRepository.findByEmail(vendor.getEmail()).orElse(null);
        activityLogService.log("INVOICE", invoice.getId(), "EMAILED",
                "Invoice " + invoice.getInvoiceNumber() + " emailed to " + vendor.getVendorName(),
                invoice.getGeneratedBy(), vendorUser);
    }

    @Override
    public Page<InvoiceResponseDto> getInvoicesByVendor(UUID vendorUserId, Pageable pageable) {
        User vendorUser = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Vendor vendor = vendorRepository.findByEmail(vendorUser.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));
        return invoiceRepository.findByVendorId(vendor.getId(), pageable).map(this::toResponseDto);
    }

    private Invoice findInvoice(UUID invoiceId) {
        return invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
    }

    private String generateInvoiceNumber() {
        int year = LocalDate.now().getYear();
        String prefix = "INV-" + year + "-";
        long count = invoiceRepository.countByInvoiceNumberStartingWith(prefix);
        return prefix + String.format("%03d", count + 1);
    }

    private InvoiceResponseDto toResponseDto(Invoice invoice) {
        Vendor vendor = invoice.getVendor();
        return InvoiceResponseDto.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .purchaseOrderId(invoice.getPurchaseOrder().getId())
                .poNumber(invoice.getPurchaseOrder().getPoNumber())
                .vendorId(vendor.getId())
                .vendorName(vendor.getVendorName())
                .vendorEmail(vendor.getEmail())
                .vendorGstNumber(vendor.getGstNumber())
                .itemDescription(invoice.getItemDescription())
                .quantity(invoice.getQuantity())
                .unitPrice(invoice.getUnitPrice())
                .subtotal(invoice.getSubtotal())
                .gstRate(invoice.getGstRate())
                .gstAmount(invoice.getGstAmount())
                .grandTotal(invoice.getGrandTotal())
                .generatedByUserName(invoice.getGeneratedBy().getUserName())
                .emailedAt(invoice.getEmailedAt())
                .createdAt(invoice.getCreatedAt())
                .updatedAt(invoice.getUpdatedAt())
                .build();
    }
}

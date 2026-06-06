package com.mkdh.vendorbridge.services.Impl;

import com.mkdh.vendorbridge.domain.dtos.SpendingSummaryDto;
import com.mkdh.vendorbridge.domain.dtos.VendorPerformanceDto;
import com.mkdh.vendorbridge.domain.entities.*;
import com.mkdh.vendorbridge.exceptions.ResourceNotFoundException;
import com.mkdh.vendorbridge.repositories.*;
import com.mkdh.vendorbridge.services.ReportsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportsServiceImpl implements ReportsService {

    private final InvoiceRepository invoiceRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final RfqRepository rfqRepository;
    private final VendorRepository vendorRepository;
    private final QuotationRepository quotationRepository;
    private final ApprovalRepository approvalRepository;

    @Override
    public SpendingSummaryDto getSpendingSummary(LocalDate from, LocalDate to) {
        LocalDate rangeFrom = from != null ? from : LocalDate.now().withDayOfYear(1);
        LocalDate rangeTo = to != null ? to : LocalDate.now();
        LocalDateTime fromDateTime = rangeFrom.atStartOfDay();
        LocalDateTime toDateTime = rangeTo.plusDays(1).atStartOfDay().minusNanos(1);

        int totalRfqs = (int) rfqRepository.findAll().stream()
                .filter(r -> isWithinRange(r.getCreatedAt(), fromDateTime, toDateTime))
                .count();

        int totalPurchaseOrders = (int) purchaseOrderRepository.findAll().stream()
                .filter(po -> isWithinRange(po.getCreatedAt(), fromDateTime, toDateTime))
                .count();

        int totalInvoices = (int) invoiceRepository.findAll().stream()
                .filter(i -> isWithinRange(i.getCreatedAt(), fromDateTime, toDateTime))
                .count();

        BigDecimal totalSubtotal = nullSafe(invoiceRepository.sumSubtotalBetween(fromDateTime, toDateTime));
        BigDecimal totalGstAmount = nullSafe(invoiceRepository.sumGstAmountBetween(fromDateTime, toDateTime));
        BigDecimal totalGrandTotal = nullSafe(invoiceRepository.sumGrandTotalBetween(fromDateTime, toDateTime));

        BigDecimal averageOrderValue = totalInvoices > 0
                ? totalGrandTotal.divide(BigDecimal.valueOf(totalInvoices), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Map<UUID, BigDecimal> vendorTotals = invoiceRepository.findAll().stream()
                .filter(i -> isWithinRange(i.getCreatedAt(), fromDateTime, toDateTime))
                .collect(Collectors.groupingBy(
                        i -> i.getVendor().getId(),
                        Collectors.reducing(BigDecimal.ZERO, Invoice::getGrandTotal, BigDecimal::add)
                ));

        String topVendorName = null;
        BigDecimal topVendorValue = BigDecimal.ZERO;
        for (Map.Entry<UUID, BigDecimal> entry : vendorTotals.entrySet()) {
            if (entry.getValue().compareTo(topVendorValue) > 0) {
                topVendorValue = entry.getValue();
                topVendorName = vendorRepository.findById(entry.getKey())
                        .map(Vendor::getVendorName)
                        .orElse(null);
            }
        }

        return SpendingSummaryDto.builder()
                .from(rangeFrom)
                .to(rangeTo)
                .totalRfqs(totalRfqs)
                .totalPurchaseOrders(totalPurchaseOrders)
                .totalInvoices(totalInvoices)
                .totalSubtotal(totalSubtotal)
                .totalGstAmount(totalGstAmount)
                .totalGrandTotal(totalGrandTotal)
                .averageOrderValue(averageOrderValue)
                .topVendorName(topVendorName)
                .topVendorValue(topVendorValue)
                .build();
    }

    @Override
    public List<VendorPerformanceDto> getVendorPerformance() {
        return vendorRepository.findAll().stream()
                .map(this::buildVendorPerformance)
                .sorted(Comparator.comparing(VendorPerformanceDto::getTotalBusinessValue).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public VendorPerformanceDto getVendorPerformanceById(UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found"));
        return buildVendorPerformance(vendor);
    }

    @Override
    public Object getRfqTrends(String groupBy, LocalDate from, LocalDate to) {
        LocalDate rangeFrom = from != null ? from : LocalDate.now().minusMonths(11).withDayOfMonth(1);
        LocalDate rangeTo = to != null ? to : LocalDate.now();
        LocalDateTime fromDateTime = rangeFrom.atStartOfDay();
        LocalDateTime toDateTime = rangeTo.plusDays(1).atStartOfDay().minusNanos(1);

        Map<String, Long> trends = rfqRepository.findAll().stream()
                .filter(r -> isWithinRange(r.getCreatedAt(), fromDateTime, toDateTime))
                .collect(Collectors.groupingBy(
                        r -> formatTrendKey(r.getCreatedAt().toLocalDate(), groupBy),
                        TreeMap::new,
                        Collectors.counting()
                ));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("groupBy", groupBy != null ? groupBy : "monthly");
        response.put("from", rangeFrom);
        response.put("to", rangeTo);
        response.put("trends", trends);
        return response;
    }

    @Override
    public Object getApprovalStats() {
        List<Approval> approvals = approvalRepository.findAll();

        long pending = approvals.stream().filter(a -> a.getStatus() == ApprovalStatus.PENDING).count();
        long approved = approvals.stream().filter(a -> a.getStatus() == ApprovalStatus.APPROVED).count();
        long rejected = approvals.stream().filter(a -> a.getStatus() == ApprovalStatus.REJECTED).count();
        long reviewed = approved + rejected;

        double approvalRate = reviewed > 0 ? (approved * 100.0) / reviewed : 0.0;

        double averageTurnaroundHours = approvals.stream()
                .filter(a -> a.getReviewedAt() != null)
                .mapToLong(a -> ChronoUnit.HOURS.between(a.getCreatedAt(), a.getReviewedAt()))
                .average()
                .orElse(0.0);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", approvals.size());
        stats.put("pending", pending);
        stats.put("approved", approved);
        stats.put("rejected", rejected);
        stats.put("approvalRatePercent", Math.round(approvalRate * 100.0) / 100.0);
        stats.put("averageTurnaroundHours", Math.round(averageTurnaroundHours * 100.0) / 100.0);
        return stats;
    }

    private VendorPerformanceDto buildVendorPerformance(Vendor vendor) {
        List<Quotation> quotations = quotationRepository.findByVendorId(vendor.getId());
        int submitted = quotations.size();
        int won = (int) quotations.stream()
                .filter(q -> q.getStatus() == QuotationStatus.SELECTED)
                .count();

        double winRate = submitted > 0 ? (won * 100.0) / submitted : 0.0;

        BigDecimal totalBusinessValue = purchaseOrderRepository.findByVendorId(vendor.getId()).stream()
                .map(PurchaseOrder::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double averageDeliveryDays = quotations.stream()
                .mapToInt(Quotation::getDeliveryDays)
                .average()
                .orElse(0.0);

        return VendorPerformanceDto.builder()
                .vendorId(vendor.getId())
                .vendorName(vendor.getVendorName())
                .email(vendor.getEmail())
                .rating(vendor.getRating())
                .totalRfqsAssigned(rfqRepository.findByAssignedVendorId(vendor.getId()).size())
                .totalQuotationsSubmitted(submitted)
                .totalQuotationsWon(won)
                .winRatePercent(Math.round(winRate * 100.0) / 100.0)
                .totalBusinessValue(totalBusinessValue)
                .averageDeliveryDays(Math.round(averageDeliveryDays * 100.0) / 100.0)
                .build();
    }

    private boolean isWithinRange(LocalDateTime value, LocalDateTime from, LocalDateTime to) {
        return value != null && !value.isBefore(from) && !value.isAfter(to);
    }

    private BigDecimal nullSafe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private String formatTrendKey(LocalDate date, String groupBy) {
        if ("weekly".equalsIgnoreCase(groupBy)) {
            LocalDate weekStart = date.minusDays(date.getDayOfWeek().getValue() - 1L);
            return weekStart.toString();
        }
        return date.getYear() + "-" + String.format("%02d", date.getMonthValue());
    }
}

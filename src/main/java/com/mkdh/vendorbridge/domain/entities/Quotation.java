package com.mkdh.vendorbridge.domain.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "quotations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"rfq_id", "vendor_id"}))
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Quotation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rfq_id", nullable = false)
    private Rfq rfq;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @Column(name = "price_per_unit", nullable = false, precision = 15, scale = 2)
    private BigDecimal pricePerUnit;

    // Computed: pricePerUnit × rfq.quantity
    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "delivery_days", nullable = false)
    private Integer deliveryDays;              // e.g. 7

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private QuotationStatus status = QuotationStatus.SUBMITTED;

    @Column(name = "is_best_price")
    private Boolean isBestPrice = false;      // flagged during comparison

    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
package com.mkdh.vendorbridge.domain.entities;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "rfqs")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Rfq {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "product_service", nullable = false)
    private String productService;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit")
    private String unit;                       // e.g. "units", "kg", "litres"

    @Column(name = "deadline", nullable = false)
    private LocalDate deadline;

    @Column(name = "attachments")
    private String attachments;               // comma-separated file paths / URLs

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RfqStatus status = RfqStatus.OPEN;

    // Procurement Officer who created this RFQ
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    // Vendors invited to quote on this RFQ
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "rfq_vendors",
            joinColumns = @JoinColumn(name = "rfq_id"),
            inverseJoinColumns = @JoinColumn(name = "vendor_id")
    )
    private Set<Vendor> assignedVendors = new HashSet<>();

    @OneToMany(mappedBy = "rfq", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Quotation> quotations = new ArrayList<>();

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
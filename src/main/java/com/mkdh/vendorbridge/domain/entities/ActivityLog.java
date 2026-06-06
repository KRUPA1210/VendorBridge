package com.mkdh.vendorbridge.domain.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "activity_logs")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    // e.g. "RFQ", "QUOTATION", "APPROVAL", "PURCHASE_ORDER", "INVOICE"
    @Column(name = "entity_type", nullable = false)
    private String entityType;

    // UUID of the related entity
    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    // e.g. "CREATED", "SUBMITTED", "SELECTED", "APPROVED", "REJECTED", "SENT", "EMAILED"
    @Column(name = "action", nullable = false)
    private String action;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Who performed the action (null = system)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by")
    private User performedBy;

    // Targeted user for notifications (e.g. vendor being notified)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id")
    private User targetUser;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
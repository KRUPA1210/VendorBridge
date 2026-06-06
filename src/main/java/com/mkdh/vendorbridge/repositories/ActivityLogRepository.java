package com.mkdh.vendorbridge.repositories;

import com.mkdh.vendorbridge.domain.entities.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {

    Page<ActivityLog> findByEntityId(UUID entityId, Pageable pageable);

    Page<ActivityLog> findByEntityIdIn(List<UUID> entityIds, Pageable pageable);

    @Query("SELECT a FROM ActivityLog a WHERE " +
           "(:entityType IS NULL OR a.entityType = :entityType) AND " +
           "(:action IS NULL OR a.action = :action)")
    Page<ActivityLog> findByFilters(
            @Param("entityType") String entityType,
            @Param("action") String action,
            Pageable pageable);

    @Query("SELECT a FROM ActivityLog a WHERE a.entityType = 'RFQ' AND a.entityId = :rfqId")
    Page<ActivityLog> findByRfqId(@Param("rfqId") UUID rfqId, Pageable pageable);

    @Query("SELECT a FROM ActivityLog a WHERE a.performedBy.id = :userId OR a.targetUser.id = :userId")
    Page<ActivityLog> findByUserInvolvement(@Param("userId") UUID userId, Pageable pageable);

    // Notifications for a specific user
    @Query("SELECT a FROM ActivityLog a WHERE a.targetUser.id = :userId " +
           "AND (:unreadOnly = false OR a.isRead = false)")
    Page<ActivityLog> findNotificationsForUser(
            @Param("userId") UUID userId,
            @Param("unreadOnly") boolean unreadOnly,
            Pageable pageable);
}
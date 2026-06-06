package com.mkdh.vendorbridge.services;

import com.mkdh.vendorbridge.domain.dtos.ActivityLogResponseDto;
import com.mkdh.vendorbridge.domain.entities.ActivityLog;
import com.mkdh.vendorbridge.domain.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ActivityLogService {

    // Called internally by other services — not directly by controllers
    ActivityLog log(String entityType, UUID entityId, String action,
                    String description, User performedBy, User targetUser);

    Page<ActivityLogResponseDto> getAllLogs(String entityType, String action, Pageable pageable);

    Page<ActivityLogResponseDto> getLogsByRfq(UUID rfqId, Pageable pageable);

    Page<ActivityLogResponseDto> getLogsByVendor(UUID vendorId, Pageable pageable);

    Page<ActivityLogResponseDto> getNotificationsForUser(UUID userId, boolean unreadOnly, Pageable pageable);
}
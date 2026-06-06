package com.mkdh.vendorbridge.controllers;

import com.mkdh.vendorbridge.domain.dtos.ActivityLogResponseDto;
import com.mkdh.vendorbridge.security.VendorBridgeUserDetails;
import com.mkdh.vendorbridge.services.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/activity-log")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ActivityLogResponseDto>> getAllLogs(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String action,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ActivityLogResponseDto> logs = activityLogService.getAllLogs(entityType, action, pageable);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/rfq/{rfqId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<Page<ActivityLogResponseDto>> getLogsByRfq(
            @PathVariable UUID rfqId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ActivityLogResponseDto> logs = activityLogService.getLogsByRfq(rfqId, pageable);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/vendor/{vendorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ActivityLogResponseDto>> getLogsByVendor(
            @PathVariable UUID vendorId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ActivityLogResponseDto> logs = activityLogService.getLogsByVendor(vendorId, pageable);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/my-notifications")
    public ResponseEntity<Page<ActivityLogResponseDto>> getMyNotifications(
            @AuthenticationPrincipal VendorBridgeUserDetails userDetails,
            @RequestParam(required = false, defaultValue = "false") boolean unreadOnly,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<ActivityLogResponseDto> logs = activityLogService.getNotificationsForUser(
                userDetails.getId(), unreadOnly, pageable);
        return ResponseEntity.ok(logs);
    }
}

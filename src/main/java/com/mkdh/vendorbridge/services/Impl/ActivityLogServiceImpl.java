package com.mkdh.vendorbridge.services.Impl;

import com.mkdh.vendorbridge.domain.dtos.ActivityLogResponseDto;
import com.mkdh.vendorbridge.domain.entities.ActivityLog;
import com.mkdh.vendorbridge.domain.entities.User;
import com.mkdh.vendorbridge.domain.entities.Vendor;
import com.mkdh.vendorbridge.exceptions.ResourceNotFoundException;
import com.mkdh.vendorbridge.repositories.ActivityLogRepository;
import com.mkdh.vendorbridge.repositories.ApprovalRepository;
import com.mkdh.vendorbridge.repositories.QuotationRepository;
import com.mkdh.vendorbridge.repositories.UserRepository;
import com.mkdh.vendorbridge.repositories.VendorRepository;
import com.mkdh.vendorbridge.services.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final QuotationRepository quotationRepository;
    private final ApprovalRepository approvalRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ActivityLog log(String entityType, UUID entityId, String action,
                           String description, User performedBy, User targetUser) {
        ActivityLog activityLog = new ActivityLog();
        activityLog.setEntityType(entityType);
        activityLog.setEntityId(entityId);
        activityLog.setAction(action);
        activityLog.setDescription(description);
        activityLog.setPerformedBy(performedBy);
        activityLog.setTargetUser(targetUser);
        activityLog.setIsRead(false);
        return activityLogRepository.save(activityLog);
    }

    @Override
    public Page<ActivityLogResponseDto> getAllLogs(String entityType, String action, Pageable pageable) {
        String normalizedEntityType = blankToNull(entityType);
        String normalizedAction = blankToNull(action);
        return activityLogRepository.findByFilters(normalizedEntityType, normalizedAction, pageable)
                .map(this::toResponseDto);
    }

    @Override
    public Page<ActivityLogResponseDto> getLogsByRfq(UUID rfqId, Pageable pageable) {
        List<UUID> entityIds = new ArrayList<>();
        entityIds.add(rfqId);
        quotationRepository.findByRfqId(rfqId).forEach(q -> entityIds.add(q.getId()));
        approvalRepository.findByRfqId(rfqId).ifPresent(a -> entityIds.add(a.getId()));
        return activityLogRepository.findByEntityIdIn(entityIds, pageable).map(this::toResponseDto);
    }

    @Override
    public Page<ActivityLogResponseDto> getLogsByVendor(UUID vendorId, Pageable pageable) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found"));
        User vendorUser = userRepository.findByEmail(vendor.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User account not found for vendor"));
        return activityLogRepository.findByUserInvolvement(vendorUser.getId(), pageable)
                .map(this::toResponseDto);
    }

    @Override
    public Page<ActivityLogResponseDto> getNotificationsForUser(UUID userId, boolean unreadOnly, Pageable pageable) {
        return activityLogRepository.findNotificationsForUser(userId, unreadOnly, pageable)
                .map(this::toResponseDto);
    }

    private ActivityLogResponseDto toResponseDto(ActivityLog log) {
        return ActivityLogResponseDto.builder()
                .id(log.getId())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .action(log.getAction())
                .description(log.getDescription())
                .performedByUserName(log.getPerformedBy() != null ? log.getPerformedBy().getUserName() : null)
                .targetUserName(log.getTargetUser() != null ? log.getTargetUser().getUserName() : null)
                .isRead(log.getIsRead())
                .createdAt(log.getCreatedAt())
                .build();
    }

    private String blankToNull(String value) {
        return value != null && !value.isBlank() ? value : null;
    }
}

package com.mkdh.vendorbridge.domain.dtos;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActivityLogResponseDto {

    private UUID id;
    private String entityType;
    private UUID entityId;
    private String action;
    private String description;

    private String performedByUserName;     // null = System
    private String targetUserName;

    private Boolean isRead;
    private LocalDateTime createdAt;
}
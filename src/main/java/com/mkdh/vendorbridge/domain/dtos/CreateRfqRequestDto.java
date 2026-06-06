package com.mkdh.vendorbridge.domain.dtos;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateRfqRequestDto {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Product/Service name is required")
    private String productService;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private String unit;                    // e.g. "units", "kg"

    @NotNull(message = "Deadline is required")
    @Future(message = "Deadline must be a future date")
    private LocalDate deadline;

    private String attachments;             // comma-separated URLs

    @NotEmpty(message = "At least one vendor must be assigned")
    private Set<UUID> vendorIds;            // assigned vendor IDs
}
package com.mkdh.vendorbridge.domain.entities;

public enum QuotationStatus {
    SUBMITTED,  // Vendor submitted
    SELECTED,   // Procurement officer selected this one
    REJECTED,   // Not selected
    WITHDRAWN   // Vendor withdrew before deadline
}
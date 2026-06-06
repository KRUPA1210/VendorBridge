package com.mkdh.vendorbridge.domain.entities;

public enum RfqStatus {
    OPEN,       // Accepting quotations
    CLOSED,     // Deadline passed or manually closed
    AWARDED,    // Quotation selected, sent for approval
    APPROVED,   // Manager approved
    REJECTED    // Manager rejected
}
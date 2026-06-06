// Centralized role permission configuration for VendorBridge ERP

export const ROLES = {
  OFFICER: 'procurement_officer',
  VENDOR: 'vendor',
  MANAGER: 'manager',
  ADMIN: 'admin',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

export const SCREEN_ACCESS = {
  dashboard: ['procurement_officer', 'manager', 'admin', 'vendor'],
  vendors: ['procurement_officer', 'admin'],
  rfqMgmt: ['procurement_officer', 'admin', 'vendor'], // Vendor sees 'My RFQs' (read-only)
  quotations: ['procurement_officer', 'vendor', 'admin'], // Officer/Admin see read-only quotes list
  compareQts: ['procurement_officer', 'admin', 'manager'], // Manager has read-only view
  approvals: ['manager', 'admin', 'procurement_officer'], // Officer has read-only view
  poInvoice: ['procurement_officer', 'admin', 'manager', 'vendor'], // Manager/Vendor view-only
  activityLogs: ['procurement_officer', 'manager', 'admin', 'vendor'], // Vendor view own only
  reports: ['procurement_officer', 'manager', 'admin'], // Manager sees no export button
  userManagement: ['admin'],
  settings: ['admin', 'procurement_officer'],
};

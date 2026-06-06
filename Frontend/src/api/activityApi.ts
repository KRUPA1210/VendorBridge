// Activity Log / Audit Trail API endpoints (ADMIN, PROCUREMENT_OFFICER only)
import api from './api';

export const activityApi = {
  getAll: (page = 0, size = 20, type?: string, startDate?: string, endDate?: string) =>
    api.get('/api/v1/activity-log/all', { params: { page, size, type, startDate, endDate } }),

  getRfqBids: (page = 0, size = 10) =>
    api.get('/api/v1/activity-log/rfqs-bids', { params: { page, size } }),

  getSuppliers: (page = 0, size = 10) =>
    api.get('/api/v1/activity-log/suppliers', { params: { page, size } }),

  getPurchaseOrders: (page = 0, size = 10) =>
    api.get('/api/v1/activity-log/purchase-orders', { params: { page, size } }),

  getFinancial: (page = 0, size = 10) =>
    api.get('/api/v1/activity-log/financial', { params: { page, size } }),
};

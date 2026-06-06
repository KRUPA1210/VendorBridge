// Reports API endpoints (ADMIN, PROCUREMENT_OFFICER, MANAGER)
import api from './api';

export const reportsApi = {
  getSummary: () =>
    api.get('/api/v1/reports/summary'),

  getSpendTrend: (months = 12) =>
    api.get('/api/v1/reports/spend-trend', { params: { months } }),

  getCategorySpend: () =>
    api.get('/api/v1/reports/category-spend'),

  getVendorPerformance: (limit = 10) =>
    api.get('/api/v1/reports/vendor-performance', { params: { limit } }),

  getSavings: () =>
    api.get('/api/v1/reports/savings'),
};

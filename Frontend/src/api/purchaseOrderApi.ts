// Purchase Order API endpoints
import api from './api';

export const purchaseOrderApi = {
  generate: (approvalId: string) =>
    api.post(`/api/v1/purchase-order/generate/${approvalId}`),

  getAll: (status?: string, page = 0, size = 10) =>
    api.get('/api/v1/purchase-order/all', { params: { status, page, size } }),

  getById: (poId: string) =>
    api.get(`/api/v1/purchase-order/${poId}`),

  send: (poId: string) =>
    api.post(`/api/v1/purchase-order/${poId}/send`),

  downloadPdf: (poId: string) =>
    api.get(`/api/v1/purchase-order/${poId}/download`, { responseType: 'blob' }),

  getMyOrders: (page = 0, size = 10) =>
    api.get('/api/v1/purchase-order/vendor/my-orders', { params: { page, size } }),

  updateStatus: (poId: string, status: string) =>
    api.patch(`/api/v1/purchase-order/${poId}/status`, { status }),
};

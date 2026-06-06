// RFQ (Request for Quotation) API endpoints (ADMIN, PROCUREMENT_OFFICER only)
import api from './api';

export const rfqApi = {
  getAll: (page = 0, size = 10, status?: string, search?: string) =>
    api.get('/api/v1/rfq/all', { params: { page, size, status, search } }),

  getById: (id: string) =>
    api.get(`/api/v1/rfq/${id}`),

  create: (payload: any) =>
    api.post('/api/v1/rfq/create', payload),

  update: (id: string, payload: any) =>
    api.put(`/api/v1/rfq/${id}`, payload),

  delete: (id: string) =>
    api.delete(`/api/v1/rfq/${id}`),

  broadcast: (id: string) =>
    api.post(`/api/v1/rfq/${id}/broadcast`),

  updateStatus: (id: string, status: string) =>
    api.patch(`/api/v1/rfq/${id}/status`, { status }),

  getMyRfqs: () =>
    api.get('/api/v1/rfq/my-rfqs'),
};

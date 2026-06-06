// Vendor Management API endpoints (ADMIN, PROCUREMENT_OFFICER only)
import api from './api';

export interface VendorPayload {
  vendorName: string;
  email: string;
  phoneNumber: string;
  gstNumber: string;
  address: string;
  category?: string;
}

export const vendorApi = {
  getAll: (page = 0, size = 10, status?: string, search?: string) =>
    api.get('/api/v1/vendor/all', { params: { page, size, status, search } }),

  getById: (id: string) =>
    api.get(`/api/v1/vendor/${id}`),

  create: (payload: VendorPayload) =>
    api.post('/api/v1/vendor/create', payload),

  update: (id: string, payload: Partial<VendorPayload>) =>
    api.put(`/api/v1/vendor/${id}`, payload),

  delete: (id: string) =>
    api.delete(`/api/v1/vendor/${id}`),

  updateStatus: (id: string, status: 'ACTIVE' | 'PENDING' | 'BLOCKED') =>
    api.patch(`/api/v1/vendor/${id}/status`, { status }),
};

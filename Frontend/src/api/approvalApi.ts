// Approval/PO Sign-Off API endpoints (ADMIN, PROCUREMENT_OFFICER, MANAGER)
import api from './api';

export const approvalApi = {
  requestApproval: (quotationId: string) =>
    api.post(`/api/v1/approval/request/${quotationId}`),

  approve: (approvalId: string, remarks?: string) =>
    api.post(`/api/v1/approval/${approvalId}/approve`, { remarks }),

  reject: (approvalId: string, remarks: string) =>
    api.post(`/api/v1/approval/${approvalId}/reject`, { remarks }),

  getPending: (page = 0, size = 10) =>
    api.get('/api/v1/approval/pending', { params: { page, size } }),

  getAll: (status?: string, page = 0, size = 10) =>
    api.get('/api/v1/approval/all', { params: { status, page, size } }),

  getById: (approvalId: string) =>
    api.get(`/api/v1/approval/${approvalId}`),

  getByRfq: (rfqId: string) =>
    api.get(`/api/v1/approval/rfq/${rfqId}`),

  getHistory: (page = 0, size = 10) =>
    api.get('/api/v1/approval/history', { params: { page, size } }),
};

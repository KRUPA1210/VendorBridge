// Invoice API endpoints
import api from './api';

export const invoiceApi = {
  generate: (poId: string) =>
    api.post(`/api/v1/invoice/generate/${poId}`),

  getAll: (status?: string, page = 0, size = 10) =>
    api.get('/api/v1/invoice/all', { params: { status, page, size } }),

  getById: (invoiceId: string) =>
    api.get(`/api/v1/invoice/${invoiceId}`),

  sendEmail: (invoiceId: string) =>
    api.post(`/api/v1/invoice/${invoiceId}/send-email`),

  downloadPdf: (invoiceId: string) =>
    api.get(`/api/v1/invoice/${invoiceId}/download`, { responseType: 'blob' }),

  markPaid: (invoiceId: string) =>
    api.patch(`/api/v1/invoice/${invoiceId}/mark-paid`),

  getByPo: (poId: string) =>
    api.get(`/api/v1/invoice/po/${poId}`),
};

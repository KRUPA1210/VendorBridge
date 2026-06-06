// Quotation (Bid) API endpoints (VENDOR, ADMIN, PROCUREMENT_OFFICER)
import api from './api';

export const quotationApi = {
  submit: (rfqId: string, payload: any) =>
    api.post(`/api/v1/quotation/submit/${rfqId}`, payload),

  getByRfq: (rfqId: string) =>
    api.get(`/api/v1/quotation/rfq/${rfqId}`),

  getById: (id: string) =>
    api.get(`/api/v1/quotation/${id}`),

  select: (quotationId: string) =>
    api.post(`/api/v1/quotation/${quotationId}/select`),

  compare: (rfqId: string) =>
    api.get(`/api/v1/quotation/compare/${rfqId}`),

  update: (id: string, payload: any) =>
    api.put(`/api/v1/quotation/${id}`, payload),

  getMyQuotations: () =>
    api.get('/api/v1/quotation/my-quotations'),
};

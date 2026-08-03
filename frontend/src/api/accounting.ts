import { apiRequest, apiRequestFull } from '@/lib/apiClient';
import type {
  Invoice,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  ListInvoicesParams,
  Payment,
  CreatePaymentPayload,
  UpdatePaymentPayload,
  ListPaymentsParams,
  CarrierPayment,
  CreateCarrierPaymentPayload,
  UpdateCarrierPaymentPayload,
  ListCarrierPaymentsParams,
  AccountingDashboard,
  AccountingDashboardParams,
  AccountingListResult,
} from '@/types/accounting';

export const invoicesApi = {
  list: async (params: ListInvoicesParams) => {
    const res = await apiRequestFull<Invoice[]>({ method: 'GET', url: '/invoices', params });
    return { items: res.data ?? [], pagination: res.pagination! } as AccountingListResult<Invoice>;
  },

  getById: (id: string) => apiRequest<Invoice>({ method: 'GET', url: `/invoices/${id}` }),

  create: (payload: CreateInvoicePayload) => apiRequest<Invoice>({ method: 'POST', url: '/invoices', data: payload }),

  update: (id: string, payload: UpdateInvoicePayload) =>
    apiRequest<Invoice>({ method: 'PUT', url: `/invoices/${id}`, data: payload }),

  remove: (id: string) => apiRequest<null>({ method: 'DELETE', url: `/invoices/${id}` }),
};

export const paymentsApi = {
  list: async (params: ListPaymentsParams) => {
    const res = await apiRequestFull<Payment[]>({ method: 'GET', url: '/payments', params });
    return { items: res.data ?? [], pagination: res.pagination! } as AccountingListResult<Payment>;
  },

  getById: (id: string) => apiRequest<Payment>({ method: 'GET', url: `/payments/${id}` }),

  create: (payload: CreatePaymentPayload) => apiRequest<Payment>({ method: 'POST', url: '/payments', data: payload }),

  update: (id: string, payload: UpdatePaymentPayload) =>
    apiRequest<Payment>({ method: 'PUT', url: `/payments/${id}`, data: payload }),

  remove: (id: string) => apiRequest<null>({ method: 'DELETE', url: `/payments/${id}` }),
};

export const carrierPaymentsApi = {
  list: async (params: ListCarrierPaymentsParams) => {
    const res = await apiRequestFull<CarrierPayment[]>({ method: 'GET', url: '/carrier-payments', params });
    return { items: res.data ?? [], pagination: res.pagination! } as AccountingListResult<CarrierPayment>;
  },

  getById: (id: string) => apiRequest<CarrierPayment>({ method: 'GET', url: `/carrier-payments/${id}` }),

  create: (payload: CreateCarrierPaymentPayload) =>
    apiRequest<CarrierPayment>({ method: 'POST', url: '/carrier-payments', data: payload }),

  update: (id: string, payload: UpdateCarrierPaymentPayload) =>
    apiRequest<CarrierPayment>({ method: 'PUT', url: `/carrier-payments/${id}`, data: payload }),

  remove: (id: string) => apiRequest<null>({ method: 'DELETE', url: `/carrier-payments/${id}` }),
};

export const accountingDashboardApi = {
  get: (params: AccountingDashboardParams = {}) =>
    apiRequest<AccountingDashboard>({ method: 'GET', url: '/accounting/dashboard', params }),
};

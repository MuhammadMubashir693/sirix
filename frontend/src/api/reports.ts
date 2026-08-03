import { apiRequestFull } from '@/lib/apiClient';

export interface ReportSummary {
  totalRevenue: number;
  totalInvoiced: number;
  outstanding: number;
  totalExpenses?: number;
  totalProfit?: number;
  periods: Array<{
    label: string;
    revenue: number;
    invoiced?: number;
    expenses?: number;
    profit?: number;
  }>;
}

export interface ReportEntity {
  id: string;
  name: string;
  email?: string;
  total?: number;
  amount?: number;
  status?: string;
  paid?: number;
}

export interface ReportCollection<T> {
  items: T[];
}

export const reportsApi = {
  revenue: (params: Record<string, string | undefined> = {}) =>
    apiRequestFull<ReportSummary>({ method: 'GET', url: '/reports/revenue', params }),
  profit: (params: Record<string, string | undefined> = {}) =>
    apiRequestFull<ReportSummary>({ method: 'GET', url: '/reports/profit', params }),
  customers: (params: Record<string, string | undefined> = {}) =>
    apiRequestFull<ReportCollection<ReportEntity>>({ method: 'GET', url: '/reports/customers', params }),
  carriers: (params: Record<string, string | undefined> = {}) =>
    apiRequestFull<ReportCollection<ReportEntity>>({ method: 'GET', url: '/reports/carriers', params }),
  vendors: (params: Record<string, string | undefined> = {}) =>
    apiRequestFull<ReportCollection<ReportEntity>>({ method: 'GET', url: '/reports/vendors', params }),
};

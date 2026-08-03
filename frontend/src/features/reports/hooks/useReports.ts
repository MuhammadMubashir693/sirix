import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api/reports';

const REPORTS_KEY = ['reports'];

export function useRevenueReport(params: Record<string, string | undefined> = {}) {
  return useQuery({
    queryKey: [...REPORTS_KEY, 'revenue', params],
    queryFn: () => reportsApi.revenue(params),
  });
}

export function useProfitReport(params: Record<string, string | undefined> = {}) {
  return useQuery({
    queryKey: [...REPORTS_KEY, 'profit', params],
    queryFn: () => reportsApi.profit(params),
  });
}

export function useCustomerReport(params: Record<string, string | undefined> = {}) {
  return useQuery({
    queryKey: [...REPORTS_KEY, 'customers', params],
    queryFn: () => reportsApi.customers(params),
  });
}

export function useCarrierReport(params: Record<string, string | undefined> = {}) {
  return useQuery({
    queryKey: [...REPORTS_KEY, 'carriers', params],
    queryFn: () => reportsApi.carriers(params),
  });
}

export function useVendorReport(params: Record<string, string | undefined> = {}) {
  return useQuery({
    queryKey: [...REPORTS_KEY, 'vendors', params],
    queryFn: () => reportsApi.vendors(params),
  });
}

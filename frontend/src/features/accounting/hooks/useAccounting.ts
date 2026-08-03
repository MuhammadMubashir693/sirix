import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { invoicesApi, paymentsApi, carrierPaymentsApi, accountingDashboardApi } from '@/api/accounting';
import type {
  ListInvoicesParams,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  ListPaymentsParams,
  CreatePaymentPayload,
  UpdatePaymentPayload,
  ListCarrierPaymentsParams,
  CreateCarrierPaymentPayload,
  UpdateCarrierPaymentPayload,
  AccountingDashboardParams,
} from '@/types/accounting';
import type { ApiClientError } from '@/types';

const INVOICES_KEY = ['accounting', 'invoices'];
const PAYMENTS_KEY = ['accounting', 'payments'];
const CARRIER_PAYMENTS_KEY = ['accounting', 'carrier-payments'];
const DASHBOARD_KEY = ['accounting', 'dashboard'];

function onErrorToast(error: ApiClientError) {
  toast.error(error.message || 'An error occurred');
}

// --- Invoices ---

export function useInvoices(params: ListInvoicesParams) {
  return useQuery({
    queryKey: [...INVOICES_KEY, params],
    queryFn: () => invoicesApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: [...INVOICES_KEY, id],
    queryFn: () => invoicesApi.getById(id as string),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInvoicePayload) => invoicesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
      toast.success('Invoice created successfully');
    },
    onError: onErrorToast,
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateInvoicePayload }) => invoicesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
      toast.success('Invoice updated successfully');
    },
    onError: onErrorToast,
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invoicesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
      toast.success('Invoice deleted successfully');
    },
    onError: onErrorToast,
  });
}

// --- Payments ---

export function usePayments(params: ListPaymentsParams) {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, params],
    queryFn: () => paymentsApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function usePayment(id: string | undefined) {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, id],
    queryFn: () => paymentsApi.getById(id as string),
    enabled: !!id,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePaymentPayload) => paymentsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
      toast.success('Payment recorded successfully');
    },
    onError: onErrorToast,
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePaymentPayload }) => paymentsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
      toast.success('Payment updated successfully');
    },
    onError: onErrorToast,
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
      toast.success('Payment deleted successfully');
    },
    onError: onErrorToast,
  });
}

// --- Carrier payments ---

export function useCarrierPayments(params: ListCarrierPaymentsParams) {
  return useQuery({
    queryKey: [...CARRIER_PAYMENTS_KEY, params],
    queryFn: () => carrierPaymentsApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useCarrierPayment(id: string | undefined) {
  return useQuery({
    queryKey: [...CARRIER_PAYMENTS_KEY, id],
    queryFn: () => carrierPaymentsApi.getById(id as string),
    enabled: !!id,
  });
}

export function useCreateCarrierPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCarrierPaymentPayload) => carrierPaymentsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CARRIER_PAYMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
      toast.success('Carrier payment created successfully');
    },
    onError: onErrorToast,
  });
}

export function useUpdateCarrierPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCarrierPaymentPayload }) =>
      carrierPaymentsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CARRIER_PAYMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
      toast.success('Carrier payment updated successfully');
    },
    onError: onErrorToast,
  });
}

export function useDeleteCarrierPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => carrierPaymentsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CARRIER_PAYMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
      toast.success('Carrier payment deleted successfully');
    },
    onError: onErrorToast,
  });
}

// --- Dashboard ---

export function useAccountingDashboard(params: AccountingDashboardParams = {}) {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, params],
    queryFn: () => accountingDashboardApi.get(params),
  });
}

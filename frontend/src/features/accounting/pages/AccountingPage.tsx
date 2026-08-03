import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { cn } from '@/lib/utils';
import {
  useAccountingDashboard,
  useInvoices,
  usePayments,
  useCarrierPayments,
} from '../hooks/useAccounting';
import type { InvoiceStatus, PaymentStatus, CarrierPaymentStatus } from '@/types/accounting';

type Tab = 'invoices' | 'payments' | 'carrier-payments';

const invoiceStatusVariant: Record<InvoiceStatus, 'success' | 'warning' | 'danger' | 'neutral' | 'brand'> = {
  paid: 'success',
  pending: 'brand',
  partially_paid: 'warning',
  overdue: 'danger',
  cancelled: 'neutral',
  draft: 'neutral',
};

const paymentStatusVariant: Record<PaymentStatus | CarrierPaymentStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  completed: 'success',
  pending: 'warning',
  failed: 'danger',
  refunded: 'neutral',
  cancelled: 'neutral',
};

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount ?? 0);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export function AccountingPage() {
  const [tab, setTab] = useState<Tab>('invoices');

  const dashboardQuery = useAccountingDashboard();
  const invoicesQuery = useInvoices({ page: 1, limit: 10 });
  const paymentsQuery = usePayments({ page: 1, limit: 10 });
  const carrierPaymentsQuery = useCarrierPayments({ page: 1, limit: 10 });

  const dashboard = dashboardQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Accounting</h1>
        <p className="text-sm text-ink-500">Invoices, customer payments, and carrier payments</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Revenue" value={dashboard ? formatCurrency(dashboard.revenue) : undefined} />
        <SummaryCard label="Expenses" value={dashboard ? formatCurrency(dashboard.expenses) : undefined} />
        <SummaryCard label="Profit" value={dashboard ? formatCurrency(dashboard.profit) : undefined} />
        <SummaryCard
          label="Outstanding Invoices"
          value={dashboard ? formatCurrency(dashboard.outstandingInvoices) : undefined}
        />
      </div>

      <div className="flex gap-1 border-b border-border">
        {(
          [
            { key: 'invoices', label: 'Invoices' },
            { key: 'payments', label: 'Payments' },
            { key: 'carrier-payments', label: 'Carrier Payments' },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-500 hover:text-ink-900'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'invoices' && (
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {invoicesQuery.isLoading ? (
              <LoadingState />
            ) : (
              <Table
                columns={['Invoice #', 'Customer', 'Due Date', 'Total', 'Balance', 'Status']}
                rows={(invoicesQuery.data?.items ?? []).map((inv) => [
                  inv.invoiceNumber,
                  inv.customer?.name ?? '—',
                  formatDate(inv.dueDate),
                  formatCurrency(inv.totalAmount, inv.currency),
                  formatCurrency(inv.outstandingBalance, inv.currency),
                  <Badge key="s" variant={invoiceStatusVariant[inv.status]}>
                    {inv.status.replace('_', ' ')}
                  </Badge>,
                ])}
              />
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'payments' && (
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {paymentsQuery.isLoading ? (
              <LoadingState />
            ) : (
              <Table
                columns={['Payment #', 'Invoice', 'Amount', 'Method', 'Paid At', 'Status']}
                rows={(paymentsQuery.data?.items ?? []).map((p) => [
                  p.paymentNumber,
                  p.invoice?.invoiceNumber ?? '—',
                  formatCurrency(p.amount, p.currency),
                  p.method.replace('_', ' '),
                  formatDate(p.paidAt),
                  <Badge key="s" variant={paymentStatusVariant[p.status]}>
                    {p.status}
                  </Badge>,
                ])}
              />
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'carrier-payments' && (
        <Card>
          <CardHeader>
            <CardTitle>Carrier Payments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {carrierPaymentsQuery.isLoading ? (
              <LoadingState />
            ) : (
              <Table
                columns={['Payment #', 'Carrier / Vendor', 'Amount', 'Method', 'Paid At', 'Status']}
                rows={(carrierPaymentsQuery.data?.items ?? []).map((p) => [
                  p.paymentNumber,
                  p.carrier?.name ?? p.vendor?.name ?? '—',
                  formatCurrency(p.amount, p.currency),
                  p.method.replace('_', ' '),
                  formatDate(p.paidAt),
                  <Badge key="s" variant={paymentStatusVariant[p.status]}>
                    {p.status}
                  </Badge>,
                ])}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-ink-500">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold text-ink-900">{value ?? '—'}</p>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="flex justify-center py-10">
      <LoadingSpinner />
    </div>
  );
}

function Table({ columns, rows }: { columns: string[]; rows: React.ReactNode[][] }) {
  if (rows.length === 0) {
    return <p className="p-6 text-sm text-ink-500">No records found.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border text-ink-500">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-6 py-3 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0 hover:bg-surface-hover">
              {row.map((cell, j) => (
                <td key={j} className="px-6 py-3 text-ink-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

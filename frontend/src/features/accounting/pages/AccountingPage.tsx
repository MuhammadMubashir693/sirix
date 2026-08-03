import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmDialog } from '@/features/admin/components/ConfirmDialog';
import { cn } from '@/lib/utils';
import {
  useAccountingDashboard,
  useInvoices,
  usePayments,
  useCarrierPayments,
  useDeleteInvoice,
  useDeletePayment,
  useDeleteCarrierPayment,
} from '../hooks/useAccounting';
import { useParties, useDeleteParty } from '../hooks/useParties';
import { InvoiceFormDialog } from '../components/InvoiceFormDialog';
import { PaymentFormDialog } from '../components/PaymentFormDialog';
import { CarrierPaymentFormDialog } from '../components/CarrierPaymentFormDialog';
import { PartyFormDialog } from '../components/PartyFormDialog';
import { formatCurrency, formatDate } from '../utils';
import type {
  Invoice,
  InvoiceStatus,
  Payment,
  PaymentStatus,
  CarrierPayment,
  CarrierPaymentStatus,
} from '@/types/accounting';
import type { Party, PartyStatus, PartyType } from '@/types/parties';

type Tab = 'invoices' | 'payments' | 'carrier-payments' | PartyType;

const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'invoices', label: 'Invoices' },
  { key: 'payments', label: 'Payments' },
  { key: 'carrier-payments', label: 'Carrier Payments' },
  { key: 'customers', label: 'Customers' },
  { key: 'carriers', label: 'Carriers' },
  { key: 'vendors', label: 'Vendors' },
];

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

const partyStatusVariant: Record<PartyStatus, 'success' | 'neutral' | 'danger'> = {
  active: 'success',
  inactive: 'neutral',
  suspended: 'danger',
};

export function AccountingPage() {
  const [tab, setTab] = useState<Tab>('invoices');

  const dashboardQuery = useAccountingDashboard();
  const dashboard = dashboardQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Accounting</h1>
        <p className="text-sm text-ink-500">
          Invoices, customer payments, carrier payments, and the counterparties they reference
        </p>
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

      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
              tab === t.key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-500 hover:text-ink-900'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'invoices' && <InvoicesTab />}
      {tab === 'payments' && <PaymentsTab />}
      {tab === 'carrier-payments' && <CarrierPaymentsTab />}
      {(tab === 'customers' || tab === 'carriers' || tab === 'vendors') && <PartiesTab type={tab} />}
    </div>
  );
}

function InvoicesTab() {
  const invoicesQuery = useInvoices({ page: 1, limit: 10 });
  const deleteMutation = useDeleteInvoice();

  const [editing, setEditing] = useState<Invoice | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Invoice | null>(null);

  return (
    <>
      <TableCard
        title="Invoices"
        newLabel="New invoice"
        onNew={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        loading={invoicesQuery.isLoading}
        columns={['Invoice #', 'Customer', 'Due Date', 'Total', 'Balance', 'Status', '']}
        rows={(invoicesQuery.data?.items ?? []).map((invoice) => [
          invoice.invoiceNumber,
          invoice.customer?.name ?? '—',
          formatDate(invoice.dueDate),
          formatCurrency(invoice.totalAmount, invoice.currency),
          formatCurrency(invoice.outstandingBalance, invoice.currency),
          <Badge key="s" variant={invoiceStatusVariant[invoice.status]}>
            {invoice.status.replace('_', ' ')}
          </Badge>,
          <RowActions
            key="a"
            label={invoice.invoiceNumber}
            onEdit={() => {
              setEditing(invoice);
              setFormOpen(true);
            }}
            onDelete={() => setDeleting(invoice)}
          />,
        ])}
      />

      <InvoiceFormDialog open={formOpen} onOpenChange={setFormOpen} invoice={editing} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete invoice"
        description={`${deleting?.invoiceNumber ?? 'This invoice'} will be removed from Accounting and Reports.`}
        confirmLabel="Delete invoice"
        loading={deleteMutation.isPending}
        onConfirm={() =>
          deleting && deleteMutation.mutate(deleting._id, { onSuccess: () => setDeleting(null) })
        }
      />
    </>
  );
}

function PaymentsTab() {
  const paymentsQuery = usePayments({ page: 1, limit: 10 });
  const deleteMutation = useDeletePayment();

  const [editing, setEditing] = useState<Payment | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Payment | null>(null);

  return (
    <>
      <TableCard
        title="Payments"
        newLabel="Record payment"
        onNew={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        loading={paymentsQuery.isLoading}
        columns={['Payment #', 'Invoice', 'Amount', 'Method', 'Paid At', 'Status', '']}
        rows={(paymentsQuery.data?.items ?? []).map((payment) => [
          payment.paymentNumber,
          payment.invoice?.invoiceNumber ?? '—',
          formatCurrency(payment.amount, payment.currency),
          payment.method.replace('_', ' '),
          formatDate(payment.paidAt),
          <Badge key="s" variant={paymentStatusVariant[payment.status]}>
            {payment.status}
          </Badge>,
          <RowActions
            key="a"
            label={payment.paymentNumber}
            onEdit={() => {
              setEditing(payment);
              setFormOpen(true);
            }}
            onDelete={() => setDeleting(payment)}
          />,
        ])}
      />

      <PaymentFormDialog open={formOpen} onOpenChange={setFormOpen} payment={editing} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete payment"
        description={`${deleting?.paymentNumber ?? 'This payment'} will no longer count towards revenue.`}
        confirmLabel="Delete payment"
        loading={deleteMutation.isPending}
        onConfirm={() =>
          deleting && deleteMutation.mutate(deleting._id, { onSuccess: () => setDeleting(null) })
        }
      />
    </>
  );
}

function CarrierPaymentsTab() {
  const carrierPaymentsQuery = useCarrierPayments({ page: 1, limit: 10 });
  const deleteMutation = useDeleteCarrierPayment();

  const [editing, setEditing] = useState<CarrierPayment | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<CarrierPayment | null>(null);

  return (
    <>
      <TableCard
        title="Carrier Payments"
        newLabel="New carrier payment"
        onNew={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        loading={carrierPaymentsQuery.isLoading}
        columns={['Payment #', 'Carrier / Vendor', 'Amount', 'Method', 'Paid At', 'Status', '']}
        rows={(carrierPaymentsQuery.data?.items ?? []).map((payment) => [
          payment.paymentNumber,
          payment.carrier?.name ?? payment.vendor?.name ?? '—',
          formatCurrency(payment.amount, payment.currency),
          payment.method.replace('_', ' '),
          formatDate(payment.paidAt),
          <Badge key="s" variant={paymentStatusVariant[payment.status]}>
            {payment.status}
          </Badge>,
          <RowActions
            key="a"
            label={payment.paymentNumber}
            onEdit={() => {
              setEditing(payment);
              setFormOpen(true);
            }}
            onDelete={() => setDeleting(payment)}
          />,
        ])}
      />

      <CarrierPaymentFormDialog open={formOpen} onOpenChange={setFormOpen} carrierPayment={editing} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete carrier payment"
        description={`${deleting?.paymentNumber ?? 'This payment'} will no longer count towards expenses.`}
        confirmLabel="Delete payment"
        loading={deleteMutation.isPending}
        onConfirm={() =>
          deleting && deleteMutation.mutate(deleting._id, { onSuccess: () => setDeleting(null) })
        }
      />
    </>
  );
}

const PARTY_COPY: Record<PartyType, { title: string; newLabel: string; keyColumn: string }> = {
  customers: { title: 'Customers', newLabel: 'New customer', keyColumn: 'Email' },
  carriers: { title: 'Carriers', newLabel: 'New carrier', keyColumn: 'Code' },
  vendors: { title: 'Vendors', newLabel: 'New vendor', keyColumn: 'Code' },
};

function PartiesTab({ type }: { type: PartyType }) {
  const partiesQuery = useParties(type, { limit: 20 });
  const deleteMutation = useDeleteParty(type);
  const copy = PARTY_COPY[type];

  const [editing, setEditing] = useState<Party | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Party | null>(null);

  return (
    <>
      <TableCard
        title={copy.title}
        newLabel={copy.newLabel}
        onNew={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        loading={partiesQuery.isLoading}
        columns={['Name', copy.keyColumn, 'Phone', 'Status', '']}
        rows={(partiesQuery.data?.items ?? []).map((party) => [
          party.name,
          (type === 'customers' ? party.email : party.code) ?? '—',
          party.phone ?? '—',
          <Badge key="s" variant={partyStatusVariant[party.status]}>
            {party.status}
          </Badge>,
          <RowActions
            key="a"
            label={party.name}
            onEdit={() => {
              setEditing(party);
              setFormOpen(true);
            }}
            onDelete={() => setDeleting(party)}
          />,
        ])}
      />

      <PartyFormDialog open={formOpen} onOpenChange={setFormOpen} type={type} party={editing} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${copy.newLabel.replace('New ', '')}`}
        description={`${deleting?.name ?? 'This record'} will no longer be selectable on new invoices and payments. Existing records keep referencing it.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() =>
          deleting && deleteMutation.mutate(deleting._id, { onSuccess: () => setDeleting(null) })
        }
      />
    </>
  );
}

function RowActions({ label, onEdit, onDelete }: { label: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" aria-label={`Edit ${label}`} onClick={onEdit}>
        <Pencil className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" aria-label={`Delete ${label}`} onClick={onDelete}>
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

interface TableCardProps {
  title: string;
  newLabel: string;
  onNew: () => void;
  loading: boolean;
  columns: string[];
  rows: React.ReactNode[][];
}

function TableCard({ title, newLabel, onNew, loading, columns, rows }: TableCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button size="sm" onClick={onNew}>
          <Plus className="size-4" />
          {newLabel}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? <LoadingState /> : <Table columns={columns} rows={rows} />}
      </CardContent>
    </Card>
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
            {columns.map((col, i) => (
              <th key={col || i} className="px-6 py-3 font-medium">
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

import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useRevenueReport, useProfitReport, useCustomerReport, useCarrierReport, useVendorReport } from '../hooks/useReports';
import type { ReportEntity } from '@/api/reports';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount ?? 0);
}

export function ReportsPage() {
  const revenueQuery = useRevenueReport();
  const profitQuery = useProfitReport();
  const customerQuery = useCustomerReport();
  const carrierQuery = useCarrierReport();
  const vendorQuery = useVendorReport();

  const revenue = revenueQuery.data?.data;
  const profit = profitQuery.data?.data;
  const customers = customerQuery.data?.data?.items ?? [];
  const carriers = carrierQuery.data?.data?.items ?? [];
  const vendors = vendorQuery.data?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Reports</h1>
        <p className="text-sm text-ink-500">Revenue, profit, and customer/carrier/vendor performance summaries</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Revenue" value={revenue ? formatCurrency(revenue.totalRevenue) : undefined} />
        <SummaryCard title="Profit" value={profit ? formatCurrency(profit.totalProfit ?? 0) : undefined} />
        <SummaryCard title="Outstanding" value={revenue ? formatCurrency(revenue.outstanding) : undefined} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {customerQuery.isLoading ? <LoadingState /> : <Table items={customers} columns={['Customer', 'Total', 'Paid', 'Status']} renderRow={(item) => [item.name, formatCurrency(item.total ?? 0), formatCurrency(item.paid ?? 0), <Badge key="status" variant="brand">{item.status ?? 'pending'}</Badge>]} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Carriers</CardTitle>
          </CardHeader>
          <CardContent>
            {carrierQuery.isLoading ? <LoadingState /> : <Table items={carriers} columns={['Carrier', 'Total', 'Status']} renderRow={(item) => [item.name, formatCurrency(item.total ?? 0), <Badge key="status" variant="brand">{item.status ?? 'pending'}</Badge>]} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            {vendorQuery.isLoading ? <LoadingState /> : <Table items={vendors} columns={['Vendor', 'Amount', 'Status']} renderRow={(item) => [item.name, formatCurrency(item.amount ?? 0), <Badge key="status" variant="brand">{item.status ?? 'pending'}</Badge>]} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            {profitQuery.isLoading ? <LoadingState /> : (
              <div className="space-y-2 text-sm text-ink-600">
                <div className="flex items-center justify-between"><span>Revenue</span><span className="font-medium text-ink-900">{profit ? formatCurrency(profit.totalRevenue ?? 0) : '—'}</span></div>
                <div className="flex items-center justify-between"><span>Expenses</span><span className="font-medium text-ink-900">{profit ? formatCurrency(profit.totalExpenses ?? 0) : '—'}</span></div>
                <div className="flex items-center justify-between"><span>Profit</span><span className="font-medium text-ink-900">{profit ? formatCurrency(profit.totalProfit ?? 0) : '—'}</span></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-ink-500">{title}</p>
        <p className="mt-1 font-display text-2xl font-semibold text-ink-900">{value ?? '—'}</p>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return <div className="flex justify-center py-6"><LoadingSpinner /></div>;
}

function Table<T extends ReportEntity>({ items, columns, renderRow }: { items: T[]; columns: string[]; renderRow: (item: T) => ReactNode[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-500">No data available for the selected period.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border text-ink-500">
          <tr>
            {columns.map((column) => <th key={column} className="px-2 py-3 font-medium">{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-border last:border-0">
              {renderRow(item).map((cell, cellIndex) => (
                <td key={`${index}-${cellIndex}`} className="px-2 py-3 text-ink-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

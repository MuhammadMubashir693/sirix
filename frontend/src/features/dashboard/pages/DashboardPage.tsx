import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

export const DashboardPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center">
        <p className="font-medium text-danger-500">Failed to load dashboard metrics.</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const { summary, systemHealth, roleDistribution, recentAuditLogs } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">System Dashboard</h1>
          <p className="text-sm text-ink-500">
            Real-time overview of platform activity, session counts, and system status.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-sm font-medium text-ink-500">Total Users</p>
          <h3 className="mt-1 font-display text-3xl font-semibold text-ink-900">
            {summary.totalUsers}
          </h3>
          <span className="mt-2 inline-block text-xs font-medium text-success-500">
            {summary.activeUsers} Active
          </span>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-medium text-ink-500">Active Sessions</p>
          <h3 className="mt-1 font-display text-3xl font-semibold text-brand-600">
            {summary.activeSessions}
          </h3>
          <span className="mt-2 inline-block text-xs text-ink-500">Live authenticated tokens</span>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-medium text-ink-500">Configured Roles</p>
          <h3 className="mt-1 font-display text-3xl font-semibold text-ink-900">
            {summary.totalRoles}
          </h3>
          <span className="mt-2 inline-block text-xs text-ink-500">RBAC Access Levels</span>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-medium text-ink-500">Database Status</p>
          <div className="mt-2 flex items-center space-x-2">
            <Badge variant={systemHealth.database === 'healthy' ? 'success' : 'danger'}>
              {systemHealth.database.toUpperCase()}
            </Badge>
          </div>
          <p className="mt-2 text-xs text-ink-500">
            Redis Cache: <span className="font-semibold text-ink-700">{systemHealth.redis}</span>
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-1">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink-900">User Roles Breakdown</h2>
          <div className="space-y-3">
            {roleDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg bg-surface-muted p-2">
                <span className="text-sm font-medium capitalize text-ink-700">
                  {item.roleName}
                </span>
                <Badge variant="brand">{item.count} users</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink-900">Recent Audit Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted text-xs uppercase text-ink-500">
                <tr>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Target Entity</th>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentAuditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-surface-hover">
                    <td className="px-4 py-2.5 font-medium text-ink-900">
                      {log.action}
                    </td>
                    <td className="px-4 py-2.5 text-ink-700">{log.module}</td>
                    <td className="px-4 py-2.5 text-ink-700">
                      {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-ink-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

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
        <p className="text-red-500 font-medium">Failed to load dashboard metrics.</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { summary, systemHealth, roleDistribution, recentAuditLogs } = data;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time overview of platform activity, session counts, and system status.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
          <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            {summary.totalUsers}
          </h3>
          <span className="text-xs text-emerald-600 font-medium mt-2 inline-block">
            {summary.activeUsers} Active
          </span>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Sessions</p>
          <h3 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {summary.activeSessions}
          </h3>
          <span className="text-xs text-gray-500 mt-2 inline-block">Live authenticated tokens</span>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Configured Roles</p>
          <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            {summary.totalRoles}
          </h3>
          <span className="text-xs text-gray-500 mt-2 inline-block">RBAC Access Levels</span>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Database Status</p>
          <div className="mt-2 flex items-center space-x-2">
            <Badge variant={systemHealth.database === 'healthy' ? 'success' : 'danger'}>
              {systemHealth.database.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Redis Cache: <span className="font-semibold">{systemHealth.redis}</span>
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-1">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">User Roles Breakdown</h2>
          <div className="space-y-3">
            {roleDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                  {item.roleName}
                </span>
                <Badge variant="brand">{item.count} users</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Audit Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Target Entity</th>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentAuditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">
                      {log.action}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">{log.entity}</td>
                    <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                      {log.userId?.username || 'System'}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-400">
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
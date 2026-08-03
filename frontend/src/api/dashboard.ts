import { apiClient } from '../lib/apiClient';

export interface DashboardMetrics {
  summary: {
    totalUsers: number;
    activeUsers: number;
    totalRoles: number;
    activeSessions: number;
  };
  systemHealth: {
    database: string;
    redis: string;
    uptime: number;
  };
  roleDistribution: Array<{
    roleName: string;
    count: number;
  }>;
  recentAuditLogs: Array<{
    _id: string;
    action: string;
    entity: string;
    createdAt: string;
    userId?: {
      username: string;
      email: string;
    };
  }>;
}

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const response = await apiClient.get('/dashboard/metrics');
  return response.data.data;
};
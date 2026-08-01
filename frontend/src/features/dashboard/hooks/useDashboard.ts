import { useQuery } from '@tanstack/react-query';
import { fetchDashboardMetrics } from '../../../api/dashboard';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    refetchInterval: 15000,
  });
};
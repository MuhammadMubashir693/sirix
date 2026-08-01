import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchDiagnostics, executeDiagnosticTest } from '../../../api/diagnostics';

export const useDiagnostics = () => {
  return useQuery({
    queryKey: ['diagnostics'],
    queryFn: fetchDiagnostics,
    refetchInterval: 10000,
  });
};

export const useRunDiagnosticTest = () => {
  return useMutation({
    mutationFn: (testType: string) => executeDiagnosticTest(testType),
  });
};
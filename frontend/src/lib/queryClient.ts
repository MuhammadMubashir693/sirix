import { QueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/types';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        const apiError = error as unknown as ApiClientError;
        // Don't retry client errors (bad request, unauthorized, forbidden, not found)
        if (apiError?.statusCode >= 400 && apiError.statusCode < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

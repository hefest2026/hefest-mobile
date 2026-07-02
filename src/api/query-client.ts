/**
 * Shared React Query client. Server state lives here; the auth session lives in
 * React context. On hard logout the cache is cleared via `queryClient.clear()`.
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

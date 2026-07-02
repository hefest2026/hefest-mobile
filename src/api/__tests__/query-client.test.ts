import { queryClient } from '@/api/query-client';

describe('queryClient', () => {
  it('exports a QueryClient with conservative defaults', () => {
    expect(queryClient).toBeDefined();
    const defaults = queryClient.getDefaultOptions();
    expect(defaults.queries?.retry).toBe(1);
    expect(defaults.queries?.staleTime).toBe(30_000);
    expect(defaults.queries?.refetchOnWindowFocus).toBe(false);
  });
});

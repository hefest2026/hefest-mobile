/* eslint-disable import/first -- jest.mock() factories must be hoisted above imports */
jest.mock('@/events/events-api', () => ({ listEvents: jest.fn() }));

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { listEvents } from '@/events/events-api';
import type { EventResponse } from '@/events/types';
import { useEventsFeed } from '@/events/use-events-feed';

const listEventsMock = listEvents as jest.Mock;

function makeEvent(overrides: Partial<EventResponse>): EventResponse {
  return {
    id: 'id',
    organizer_id: 'org',
    title: 'Title',
    description: 'Desc',
    starts_at: '2026-07-01T10:00:00Z',
    ends_at: null,
    location: 'Hall A',
    capacity: 10,
    confirmed_count: 1,
    status: 'published',
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
    ...overrides,
  };
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => jest.clearAllMocks());

describe('useEventsFeed', () => {
  it('stops pagination on a short page and exposes only published events', async () => {
    listEventsMock.mockResolvedValueOnce([
      makeEvent({ id: '1', status: 'published' }),
      makeEvent({ id: '2', status: 'draft' }),
    ]);
    const { result } = renderHook(() => useEventsFeed(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.events).toEqual([expect.objectContaining({ id: '1' })]);
    expect(result.current.hasNextPage).toBe(false);
    expect(listEventsMock).toHaveBeenCalledWith(50, 0);
  });

  it('advances by PAGE_SIZE when a full raw page is returned', async () => {
    const fullPage = Array.from({ length: 50 }, (_, i) =>
      makeEvent({ id: `p1-${i}`, status: 'published' }),
    );
    listEventsMock.mockResolvedValueOnce(fullPage);
    const { result } = renderHook(() => useEventsFeed(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    listEventsMock.mockResolvedValueOnce([makeEvent({ id: 'p2-0', status: 'published' })]);
    await result.current.fetchNextPage();

    await waitFor(() => expect(listEventsMock).toHaveBeenCalledWith(50, 50));
    await waitFor(() => expect(result.current.hasNextPage).toBe(false));
  });

  it('auto-advances when a full raw page yields zero visible (all filtered out)', async () => {
    const allDraft = Array.from({ length: 50 }, (_, i) =>
      makeEvent({ id: `d-${i}`, status: 'draft' }),
    );
    listEventsMock.mockResolvedValueOnce(allDraft);
    listEventsMock.mockResolvedValueOnce([makeEvent({ id: 'visible', status: 'published' })]);

    const { result } = renderHook(() => useEventsFeed(), { wrapper });

    await waitFor(() =>
      expect(result.current.events).toEqual([expect.objectContaining({ id: 'visible' })]),
    );
    expect(listEventsMock).toHaveBeenCalledWith(50, 0);
    expect(listEventsMock).toHaveBeenCalledWith(50, 50);
  });
});

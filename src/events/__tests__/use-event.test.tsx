/* eslint-disable import/first -- jest.mock() factories must be hoisted above imports */
jest.mock('@/events/events-api', () => ({ getEvent: jest.fn() }));

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { getEvent } from '@/events/events-api';
import type { EventResponse } from '@/events/types';
import { useEvent } from '@/events/use-event';

const getEventMock = getEvent as jest.Mock;

const listedEvent: EventResponse = {
  id: 'e1',
  organizer_id: 'org',
  title: 'Seeded Title',
  description: 'Desc',
  starts_at: '2026-07-01T10:00:00Z',
  ends_at: null,
  location: 'Hall A',
  capacity: 10,
  confirmed_count: 3,
  status: 'published',
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
};

beforeEach(() => jest.clearAllMocks());

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useEvent', () => {
  it('seeds initialData from the feed cache when present', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(['events'], { pages: [[listedEvent]], pageParams: [0] });
    getEventMock.mockResolvedValueOnce({
      ...listedEvent,
      waitlist_count: 2,
      organizer_name: 'Ada',
    });

    const { result } = renderHook(() => useEvent('e1'), {
      wrapper: makeWrapper(queryClient),
    });

    expect(result.current.data?.title).toBe('Seeded Title');
    await waitFor(() => expect(result.current.data?.organizer_name).toBe('Ada'));
  });

  it('has no seed and loads from the network when the feed cache is empty', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    getEventMock.mockResolvedValueOnce({
      ...listedEvent,
      waitlist_count: 0,
      organizer_name: 'Ada',
    });

    const { result } = renderHook(() => useEvent('e1'), {
      wrapper: makeWrapper(queryClient),
    });

    expect(result.current.data).toBeUndefined();
    await waitFor(() => expect(result.current.data?.organizer_name).toBe('Ada'));
  });
});

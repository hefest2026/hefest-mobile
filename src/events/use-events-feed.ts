/**
 * Infinite-scroll feed of published events. Pagination advances by raw
 * server page size regardless of client-side filtering, so a page that is
 * entirely draft/cancelled doesn't falsely look like the end of the list.
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { listEvents } from '@/events/events-api';
import type { EventResponse } from '@/events/types';

export const PAGE_SIZE = 50;

export function useEventsFeed() {
  const query = useInfiniteQuery({
    queryKey: ['events'],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => listEvents(PAGE_SIZE, pageParam),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined,
  });

  const events = useMemo<EventResponse[]>(
    () =>
      (query.data?.pages ?? [])
        .flat()
        .filter((event) => event.status === 'published'),
    [query.data],
  );

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  useEffect(() => {
    if (events.length === 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [events.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return { ...query, events };
}

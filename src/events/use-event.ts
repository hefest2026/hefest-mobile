/**
 * Single-event detail query, seeded from the `['events']` infinite feed
 * cache when already loaded so navigating from a card paints instantly;
 * detail-only fields (`waitlist_count` / `organizer_name`) fill in on fetch.
 */

import { useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';

import { getEvent } from '@/events/events-api';
import type { EventDetailResponse, EventResponse } from '@/events/types';

export function useEvent(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['event', id],
    queryFn: () => getEvent(id),
    initialData: () => {
      const feed = queryClient.getQueryData<InfiniteData<EventResponse[]>>(['events']);
      const seed = feed?.pages.flat().find((event) => event.id === id);
      return seed as EventDetailResponse | undefined;
    },
  });
}

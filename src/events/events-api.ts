/**
 * Typed wrappers over the hefest-api event endpoints. No token logic here —
 * the axios client's interceptors own that.
 */

import { apiClient } from '@/api/client';
import type { EventDetailResponse, EventResponse } from '@/events/types';

export async function listEvents(
  limit: number,
  offset: number,
): Promise<EventResponse[]> {
  const { data } = await apiClient.get<EventResponse[]>('/events', {
    params: { limit, offset },
  });
  return data;
}

export async function getEvent(id: string): Promise<EventDetailResponse> {
  const { data } = await apiClient.get<EventDetailResponse>(`/events/${id}`);
  return data;
}

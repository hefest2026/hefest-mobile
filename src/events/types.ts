/**
 * Shared event domain types, mirrored from the hefest-api contract
 * (`openapi.json`, verified against a running instance 2026-07-01). See the
 * HEF-42 design spec.
 */

export type EventStatus = 'draft' | 'published' | 'cancelled';

/** `GET /events` array element. */
export type EventResponse = {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
  location: string;
  /** `0` means unlimited capacity. */
  capacity: number;
  /** Present on the list response; enables spots-remaining on cards. */
  confirmed_count?: number;
  status: EventStatus;
  created_at: string;
  updated_at: string;
};

/** `GET /events/{event_id}` */
export type EventDetailResponse = EventResponse & {
  waitlist_count: number;
  organizer_name: string;
};

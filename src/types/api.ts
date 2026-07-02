/**
 * Auto-generated API domain types from `openapi.json`.
 * Run `python scripts/generate-api.py` to regenerate.
 */
export type DevicePlatform = 'ios' | 'android';

/** Request schema for registering an Expo push token.

Attributes:
    expo_push_token: The Expo push token reported by the device.
    platform: The device platform (``ios`` or ``android``). */
export type DeviceRegisterRequest = {
  expo_push_token: string;
  platform: DevicePlatform;
};

/** Response schema for a registered device.

Attributes:
    id: Device UUID.
    expo_push_token: The stored Expo push token.
    platform: The device platform.
    created_at: When the device was first registered.
    updated_at: When the registration was last refreshed. */
export type DeviceResponse = {
  id: string;
  expo_push_token: string;
  platform: DevicePlatform;
  created_at: string;
  updated_at: string;
};

/** Request schema for removing an Expo push token.

Attributes:
    expo_push_token: The Expo push token to remove. */
export type DeviceUnregisterRequest = {
  expo_push_token: string;
};

/** Body for POST /events. */
export type EventCreateRequest = {
  title: string;
  description?: string;
  starts_at: string;
  ends_at?: string | null;
  location: string;
  capacity: number;
};

/** Response schema for GET /events/{id} — includes live seat counts. */
export type EventDetailResponse = {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
  location: string;
  capacity: number;
  confirmed_count?: number;
  status: EventStatus;
  created_at: string;
  updated_at: string;
  waitlist_count: number;
  organizer_name: string;
  /** Whether the event's start time has passed (UTC).

Students never see started events in the listing; organizers use this
flag to mark their own past-start events in the dashboard. */
  has_started: boolean;
};

/** Response schema for a single event (list view). */
export type EventResponse = {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
  location: string;
  capacity: number;
  confirmed_count?: number;
  status: EventStatus;
  created_at: string;
  updated_at: string;
  /** Whether the event's start time has passed (UTC).

Students never see started events in the listing; organizers use this
flag to mark their own past-start events in the dashboard. */
  has_started: boolean;
};

export type EventStatus = 'draft' | 'published' | 'cancelled';

/** Body for PUT /events/{id} — all fields optional.

Only include fields you want to change. ``ends_at`` accepts ``null`` to
clear a previously set end time; other fields ignore ``null``. */
export type EventUpdateRequest = {
  title?: string | null;
  description?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  location?: string | null;
  capacity?: number | null;
};

export type HTTPValidationError = {
  detail?: ValidationError[];
};

/** Liveness probe response. */
export type HealthResponse = {
  status: string;
  version: string;
};

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

/** Single entry in GET /registrations/me. */
export type MyRegistrationResponse = {
  id: string;
  event_id: string;
  status: RegistrationStatus;
  registered_at: string;
  cancelled_at: string | null;
  waitlist_position: number | null;
};

/** Response for GET /notification-jobs/{id} — includes the delivery diagnostic. */
export type NotificationJobDetailResponse = {
  id: string;
  event_id: string | null;
  event_type: string;
  payload: Record<string, unknown>;
  status: JobStatus;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
  last_error: string | null;
};

/** Response for GET /notification-jobs (list). */
export type NotificationJobResponse = {
  id: string;
  event_id: string | null;
  event_type: string;
  payload: Record<string, unknown>;
  status: JobStatus;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
};

/** Aggregate metrics for an organizer's own events.

All registration counts are naturally published-only (registration requires a
published event), so ``total_capacity`` is scoped to published events to keep
the ``total_confirmed / total_capacity`` occupancy ratio coherent.

Attributes:
    events_total: Count of the organizer's events in any status.
    events_draft: Count of the organizer's draft events.
    events_published: Count of the organizer's published events.
    events_upcoming: Published events whose ``starts_at`` is in the future.
    total_capacity: Sum of capacity over the organizer's published events.
    total_confirmed: Confirmed registrations over the organizer's events.
    total_waitlisted: Waitlisted registrations over the organizer's events.
    new_registrations_7d: Confirmed registrations in the last seven days. */
export type OrganizerStatsResponse = {
  events_total: number;
  events_draft: number;
  events_published: number;
  events_upcoming: number;
  total_capacity: number;
  total_confirmed: number;
  total_waitlisted: number;
  new_registrations_7d: number;
};

/** Readiness probe response. */
export type ReadyResponse = {
  status: string;
  postgres: string;
  redis: string;
};

/** Response for POST /events/{id}/registrations. */
export type RegistrationResponse = {
  id: string;
  event_id: string;
  student_id: string;
  status: RegistrationStatus;
  registered_at: string;
  waitlist_position: number | null;
};

export type RegistrationStatus = 'confirmed' | 'waitlisted' | 'cancelled';

/** Entry in organizer-facing confirmed / waitlist lists. */
export type RegistrationSummary = {
  id: string;
  student_id: string;
  status: RegistrationStatus;
  registered_at: string;
};

export type ValidationError = {
  loc: string | number[];
  msg: string;
  type: string;
  input?: unknown;
  ctx?: Record<string, unknown>;
};

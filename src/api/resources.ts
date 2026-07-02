/**
 * Auto-generated REST API wrappers from `openapi.json`.
 * Run `python scripts/generate-api.py` to regenerate.
 */

import { apiClient } from '@/api/client';
import type {
  DeviceRegisterRequest,
  DeviceResponse,
  DeviceUnregisterRequest,
  EventCreateRequest,
  EventDetailResponse,
  EventResponse,
  EventUpdateRequest,
  HealthResponse,
  MyRegistrationResponse,
  NotificationJobDetailResponse,
  NotificationJobResponse,
  OrganizerStatsResponse,
  ReadyResponse,
  RegistrationResponse,
  RegistrationSummary,
} from '@/types/api';


export async function createEventEventsPost(body: EventCreateRequest): Promise<EventResponse> {
  const { data } = await apiClient.post<EventResponse>(`/events`, body);
  return data;
}

export async function listEventsEventsGet(limit?: string, offset?: string): Promise<EventResponse[]> {
  const params = { limit: limit, offset: offset };
  const { data } = await apiClient.get<EventResponse[]>(`/events`, { params });
  return data;
}

export async function getEventEventsEventIdGet(event_id: string): Promise<EventDetailResponse> {
  const { data } = await apiClient.get<EventDetailResponse>(`/events/${event_id}`);
  return data;
}

export async function updateEventEventsEventIdPut(event_id: string, body: EventUpdateRequest): Promise<EventResponse> {
  const { data } = await apiClient.put<EventResponse>(`/events/${event_id}`, body);
  return data;
}

export async function publishEventEventsEventIdPublishPost(event_id: string): Promise<EventResponse> {
  const { data } = await apiClient.post<EventResponse>(`/events/${event_id}/publish`);
  return data;
}

export async function cancelEventEventsEventIdCancelPost(event_id: string): Promise<EventResponse> {
  const { data } = await apiClient.post<EventResponse>(`/events/${event_id}/cancel`);
  return data;
}

export async function registerForEventEventsEventIdRegistrationsPost(event_id: string): Promise<RegistrationResponse> {
  const { data } = await apiClient.post<RegistrationResponse>(`/events/${event_id}/registrations`);
  return data;
}

export async function eventRegistrationsEventsEventIdRegistrationsGet(event_id: string, limit?: string, offset?: string): Promise<RegistrationSummary[]> {
  const params = { limit: limit, offset: offset };
  const { data } = await apiClient.get<RegistrationSummary[]>(`/events/${event_id}/registrations`, { params });
  return data;
}

export async function myRegistrationsRegistrationsMeGet(): Promise<MyRegistrationResponse[]> {
  const { data } = await apiClient.get<MyRegistrationResponse[]>(`/registrations/me`);
  return data;
}

export async function cancelRegistrationRegistrationsRegIdDelete(reg_id: string): Promise<void> {
  await apiClient.delete(`/registrations/${reg_id}`);
}

export async function eventWaitlistEventsEventIdWaitlistGet(event_id: string, limit?: string, offset?: string): Promise<RegistrationSummary[]> {
  const params = { limit: limit, offset: offset };
  const { data } = await apiClient.get<RegistrationSummary[]>(`/events/${event_id}/waitlist`, { params });
  return data;
}

export async function listNotificationJobsNotificationJobsGet(event_id?: string, limit?: string, offset?: string): Promise<NotificationJobResponse[]> {
  const params = { event_id: event_id, limit: limit, offset: offset };
  const { data } = await apiClient.get<NotificationJobResponse[]>(`/notification-jobs`, { params });
  return data;
}

export async function getNotificationJobNotificationJobsJobIdGet(job_id: string): Promise<NotificationJobDetailResponse> {
  const { data } = await apiClient.get<NotificationJobDetailResponse>(`/notification-jobs/${job_id}`);
  return data;
}

export async function registerDeviceDevicesRegisterPost(body: DeviceRegisterRequest): Promise<DeviceResponse> {
  const { data } = await apiClient.post<DeviceResponse>(`/devices/register`, body);
  return data;
}

export async function unregisterDeviceDevicesUnregisterPost(body: DeviceUnregisterRequest): Promise<void> {
  await apiClient.post(`/devices/unregister`, body);
}

export async function getStatsStatsGet(): Promise<OrganizerStatsResponse> {
  const { data } = await apiClient.get<OrganizerStatsResponse>(`/stats`);
  return data;
}

export async function flushRatelimitInternalFlushRatelimitDelete(): Promise<void> {
  await apiClient.delete(`/internal/flush-ratelimit`);
}

export async function healthHealthGet(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>(`/health`);
  return data;
}

export async function readyReadyGet(): Promise<ReadyResponse> {
  const { data } = await apiClient.get<ReadyResponse>(`/ready`);
  return data;
}

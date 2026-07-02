/**
 * Auto-generated React Query hooks from `openapi.json`.
 * Run `python scripts/generate-api.py` to regenerate.
 */

import { useMutation, useQuery } from '@tanstack/react-query';

import * as authApi from '@/auth/auth-api';
import * as resources from '@/api/resources';
import type {
  DeviceRegisterRequest,
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
  RegistrationSummary
} from '@/types/api';


export function useListEventsEventsGet(limit?: string, offset?: string) {
  return useQuery<EventResponse[]>({ queryKey: ['listEventsEventsGet', limit, offset], queryFn: () => resources.listEventsEventsGet(limit, offset) });
}

export function useGetEventEventsEventIdGet(event_id: string) {
  return useQuery<EventDetailResponse>({ queryKey: ['getEventEventsEventIdGet', event_id], queryFn: () => resources.getEventEventsEventIdGet(event_id) });
}

export function useEventRegistrationsEventsEventIdRegistrationsGet(event_id: string, limit?: string, offset?: string) {
  return useQuery<RegistrationSummary[]>({ queryKey: ['eventRegistrationsEventsEventIdRegistrationsGet', event_id, limit, offset], queryFn: () => resources.eventRegistrationsEventsEventIdRegistrationsGet(event_id, limit, offset) });
}

export function useMyRegistrationsRegistrationsMeGet() {
  return useQuery<MyRegistrationResponse[]>({ queryKey: ['myRegistrationsRegistrationsMeGet'], queryFn: resources.myRegistrationsRegistrationsMeGet });
}

export function useEventWaitlistEventsEventIdWaitlistGet(event_id: string, limit?: string, offset?: string) {
  return useQuery<RegistrationSummary[]>({ queryKey: ['eventWaitlistEventsEventIdWaitlistGet', event_id, limit, offset], queryFn: () => resources.eventWaitlistEventsEventIdWaitlistGet(event_id, limit, offset) });
}

export function useListNotificationJobsNotificationJobsGet(event_id?: string, limit?: string, offset?: string) {
  return useQuery<NotificationJobResponse[]>({ queryKey: ['listNotificationJobsNotificationJobsGet', event_id, limit, offset], queryFn: () => resources.listNotificationJobsNotificationJobsGet(event_id, limit, offset) });
}

export function useGetNotificationJobNotificationJobsJobIdGet(job_id: string) {
  return useQuery<NotificationJobDetailResponse>({ queryKey: ['getNotificationJobNotificationJobsJobIdGet', job_id], queryFn: () => resources.getNotificationJobNotificationJobsJobIdGet(job_id) });
}

export function useGetStatsStatsGet() {
  return useQuery<OrganizerStatsResponse>({ queryKey: ['getStatsStatsGet'], queryFn: resources.getStatsStatsGet });
}

export function useHealthHealthGet() {
  return useQuery<HealthResponse>({ queryKey: ['healthHealthGet'], queryFn: resources.healthHealthGet });
}

export function useReadyReadyGet() {
  return useQuery<ReadyResponse>({ queryKey: ['readyReadyGet'], queryFn: resources.readyReadyGet });
}

export function useCreateEventEventsPost() {
  return useMutation({
    mutationFn: (body: EventCreateRequest) => resources.createEventEventsPost(body),
  });
}

export function useUpdateEventEventsEventIdPut() {
  return useMutation({
    mutationFn: ({ event_id, body }: { event_id: string; body: EventUpdateRequest }) =>
      resources.updateEventEventsEventIdPut(event_id, body),
  });
}

export function usePublishEventEventsEventIdPublishPost() {
  return useMutation({
    mutationFn: (event_id: string) =>
      resources.publishEventEventsEventIdPublishPost(event_id),
  });
}

export function useCancelEventEventsEventIdCancelPost() {
  return useMutation({
    mutationFn: (event_id: string) =>
      resources.cancelEventEventsEventIdCancelPost(event_id),
  });
}

export function useRegisterForEventEventsEventIdRegistrationsPost() {
  return useMutation({
    mutationFn: (event_id: string) =>
      resources.registerForEventEventsEventIdRegistrationsPost(event_id),
  });
}

export function useCancelRegistrationRegistrationsRegIdDelete() {
  return useMutation({
    mutationFn: (reg_id: string) =>
      resources.cancelRegistrationRegistrationsRegIdDelete(reg_id),
  });
}

export function useRegisterDeviceDevicesRegisterPost() {
  return useMutation({
    mutationFn: (body: DeviceRegisterRequest) => resources.registerDeviceDevicesRegisterPost(body),
  });
}

export function useUnregisterDeviceDevicesUnregisterPost() {
  return useMutation({
    mutationFn: (body: DeviceUnregisterRequest) => resources.unregisterDeviceDevicesUnregisterPost(body),
  });
}

export function useFlushRatelimitInternalFlushRatelimitDelete() {
  return useMutation({
    mutationFn: () => resources.flushRatelimitInternalFlushRatelimitDelete(),
  });
}

/** Auth mutations (convenience only; prefer `useAuth` for session-aware flows). */
export function useRegister() {
  return useMutation({ mutationFn: authApi.register });
}

export function useVerifyEmail() {
  return useMutation({ mutationFn: authApi.verifyEmail });
}

export function useLogin() {
  return useMutation({ mutationFn: authApi.login });
}

export function useChangePassword() {
  return useMutation({ mutationFn: authApi.changePassword });
}

export function useUpdateMe() {
  return useMutation({ mutationFn: authApi.updateMe });
}

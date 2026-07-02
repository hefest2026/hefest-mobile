/* eslint-disable import/first -- jest.mock() factories must be hoisted above imports */
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: undefined, isLoading: false })),
  useMutation: jest.fn(() => ({ mutate: jest.fn(), mutateAsync: jest.fn() })),
}));
jest.mock('@/api/resources', () => ({
  listEventsEventsGet: jest.fn(),
  getEventEventsEventIdGet: jest.fn(),
  eventRegistrationsEventsEventIdRegistrationsGet: jest.fn(),
  myRegistrationsRegistrationsMeGet: jest.fn(),
  eventWaitlistEventsEventIdWaitlistGet: jest.fn(),
  listNotificationJobsNotificationJobsGet: jest.fn(),
  getNotificationJobNotificationJobsJobIdGet: jest.fn(),
  getStatsStatsGet: jest.fn(),
  healthHealthGet: jest.fn(),
  readyReadyGet: jest.fn(),
  createEventEventsPost: jest.fn(),
  updateEventEventsEventIdPut: jest.fn(),
  publishEventEventsEventIdPublishPost: jest.fn(),
  cancelEventEventsEventIdCancelPost: jest.fn(),
  registerForEventEventsEventIdRegistrationsPost: jest.fn(),
  cancelRegistrationRegistrationsRegIdDelete: jest.fn(),
  registerDeviceDevicesRegisterPost: jest.fn(),
  unregisterDeviceDevicesUnregisterPost: jest.fn(),
  flushRatelimitInternalFlushRatelimitDelete: jest.fn(),
}));
jest.mock('@/auth/auth-api', () => ({
  register: jest.fn(),
  verifyEmail: jest.fn(),
  login: jest.fn(),
  changePassword: jest.fn(),
  updateMe: jest.fn(),
}));

import { useMutation, useQuery } from '@tanstack/react-query';

import * as resources from '@/api/resources';
import * as authApi from '@/auth/auth-api';
import {
  useCancelEventEventsEventIdCancelPost,
  useCancelRegistrationRegistrationsRegIdDelete,
  useChangePassword,
  useCreateEventEventsPost,
  useEventRegistrationsEventsEventIdRegistrationsGet,
  useEventWaitlistEventsEventIdWaitlistGet,
  useFlushRatelimitInternalFlushRatelimitDelete,
  useGetEventEventsEventIdGet,
  useGetNotificationJobNotificationJobsJobIdGet,
  useGetStatsStatsGet,
  useHealthHealthGet,
  useListEventsEventsGet,
  useListNotificationJobsNotificationJobsGet,
  useLogin,
  useMyRegistrationsRegistrationsMeGet,
  usePublishEventEventsEventIdPublishPost,
  useReadyReadyGet,
  useRegister,
  useRegisterDeviceDevicesRegisterPost,
  useRegisterForEventEventsEventIdRegistrationsPost,
  useUnregisterDeviceDevicesUnregisterPost,
  useUpdateEventEventsEventIdPut,
  useUpdateMe,
  useVerifyEmail,
} from '@/api/hooks';

const useQueryMock = useQuery as jest.Mock;
const useMutationMock = useMutation as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('query hooks', () => {
  it('useListEventsEventsGet forwards params', () => {
    useListEventsEventsGet('10', '0');
    expect(useQueryMock).toHaveBeenCalledWith(expect.objectContaining({
      queryKey: ['listEventsEventsGet', '10', '0'],
    }));
  });

  it('useGetEventEventsEventIdGet forwards event id', () => {
    useGetEventEventsEventIdGet('e1');
    expect(useQueryMock).toHaveBeenCalledWith(expect.objectContaining({
      queryKey: ['getEventEventsEventIdGet', 'e1'],
    }));
  });

  it('useEventRegistrationsEventsEventIdRegistrationsGet forwards params', () => {
    useEventRegistrationsEventsEventIdRegistrationsGet('e1');
    expect(useQueryMock).toHaveBeenCalledWith(expect.objectContaining({
      queryKey: ['eventRegistrationsEventsEventIdRegistrationsGet', 'e1', undefined, undefined],
    }));
  });

  it('useMyRegistrationsRegistrationsMeGet uses expected key', () => {
    useMyRegistrationsRegistrationsMeGet();
    expect(useQueryMock).toHaveBeenCalledWith(expect.objectContaining({
      queryKey: ['myRegistrationsRegistrationsMeGet'],
    }));
  });

  it('useEventWaitlistEventsEventIdWaitlistGet forwards params', () => {
    useEventWaitlistEventsEventIdWaitlistGet('e1');
    expect(useQueryMock).toHaveBeenCalledWith(expect.objectContaining({
      queryKey: ['eventWaitlistEventsEventIdWaitlistGet', 'e1', undefined, undefined],
    }));
  });

  it('useListNotificationJobsNotificationJobsGet forwards params', () => {
    useListNotificationJobsNotificationJobsGet('e1');
    expect(useQueryMock).toHaveBeenCalledWith(expect.objectContaining({
      queryKey: ['listNotificationJobsNotificationJobsGet', 'e1', undefined, undefined],
    }));
  });

  it('useGetNotificationJobNotificationJobsJobIdGet forwards job id', () => {
    useGetNotificationJobNotificationJobsJobIdGet('n1');
    expect(useQueryMock).toHaveBeenCalledWith(expect.objectContaining({
      queryKey: ['getNotificationJobNotificationJobsJobIdGet', 'n1'],
    }));
  });

  it('useGetStatsStatsGet uses expected key', () => {
    useGetStatsStatsGet();
    expect(useQueryMock).toHaveBeenCalledWith(expect.objectContaining({
      queryKey: ['getStatsStatsGet'],
    }));
  });

  it('useHealthHealthGet uses expected key', () => {
    useHealthHealthGet();
    expect(useQueryMock).toHaveBeenCalledWith(expect.objectContaining({
      queryKey: ['healthHealthGet'],
    }));
  });

  it('useReadyReadyGet uses expected key', () => {
    useReadyReadyGet();
    expect(useQueryMock).toHaveBeenCalledWith(expect.objectContaining({
      queryKey: ['readyReadyGet'],
    }));
  });
});

describe('mutation hooks', () => {
  it('useCreateEventEventsPost calls the resource', async () => {
    useCreateEventEventsPost();
    const config = useMutationMock.mock.calls[0][0];
    const body = { title: 'T' };
    await config.mutationFn(body);
    expect(resources.createEventEventsPost).toHaveBeenCalledWith(body);
  });

  it('useUpdateEventEventsEventIdPut calls the resource', async () => {
    useUpdateEventEventsEventIdPut();
    const config = useMutationMock.mock.calls[0][0];
    await config.mutationFn({ event_id: 'e1', body: { title: 'T' } });
    expect(resources.updateEventEventsEventIdPut).toHaveBeenCalledWith('e1', { title: 'T' });
  });

  it('usePublishEventEventsEventIdPublishPost calls the resource', async () => {
    usePublishEventEventsEventIdPublishPost();
    const config = useMutationMock.mock.calls[0][0];
    await config.mutationFn('e1');
    expect(resources.publishEventEventsEventIdPublishPost).toHaveBeenCalledWith('e1');
  });

  it('useCancelEventEventsEventIdCancelPost calls the resource', async () => {
    useCancelEventEventsEventIdCancelPost();
    const config = useMutationMock.mock.calls[0][0];
    await config.mutationFn('e1');
    expect(resources.cancelEventEventsEventIdCancelPost).toHaveBeenCalledWith('e1');
  });

  it('useRegisterForEventEventsEventIdRegistrationsPost calls the resource', async () => {
    useRegisterForEventEventsEventIdRegistrationsPost();
    const config = useMutationMock.mock.calls[0][0];
    await config.mutationFn('e1');
    expect(resources.registerForEventEventsEventIdRegistrationsPost).toHaveBeenCalledWith('e1');
  });

  it('useCancelRegistrationRegistrationsRegIdDelete calls the resource', async () => {
    useCancelRegistrationRegistrationsRegIdDelete();
    const config = useMutationMock.mock.calls[0][0];
    await config.mutationFn('r1');
    expect(resources.cancelRegistrationRegistrationsRegIdDelete).toHaveBeenCalledWith('r1');
  });

  it('useRegisterDeviceDevicesRegisterPost calls the resource', async () => {
    useRegisterDeviceDevicesRegisterPost();
    const config = useMutationMock.mock.calls[0][0];
    const body = { expo_push_token: 't', platform: 'ios' as const };
    await config.mutationFn(body);
    expect(resources.registerDeviceDevicesRegisterPost).toHaveBeenCalledWith(body);
  });

  it('useUnregisterDeviceDevicesUnregisterPost calls the resource', async () => {
    useUnregisterDeviceDevicesUnregisterPost();
    const config = useMutationMock.mock.calls[0][0];
    const body = { expo_push_token: 't' };
    await config.mutationFn(body);
    expect(resources.unregisterDeviceDevicesUnregisterPost).toHaveBeenCalledWith(body);
  });

  it('useFlushRatelimitInternalFlushRatelimitDelete calls the resource', async () => {
    useFlushRatelimitInternalFlushRatelimitDelete();
    const config = useMutationMock.mock.calls[0][0];
    await config.mutationFn();
    expect(resources.flushRatelimitInternalFlushRatelimitDelete).toHaveBeenCalledWith();
  });

  it('useRegister calls authApi.register', async () => {
    useRegister();
    const config = useMutationMock.mock.calls[0][0];
    const body = { email: 'a@b.com', password: 'pw', full_name: 'A' };
    await config.mutationFn(body);
    expect(authApi.register).toHaveBeenCalledWith(body);
  });

  it('useVerifyEmail calls authApi.verifyEmail', async () => {
    useVerifyEmail();
    const config = useMutationMock.mock.calls[0][0];
    await config.mutationFn('tok');
    expect(authApi.verifyEmail).toHaveBeenCalledWith('tok');
  });

  it('useLogin calls authApi.login', async () => {
    useLogin();
    const config = useMutationMock.mock.calls[0][0];
    const body = { email: 'a@b.com', password: 'pw' };
    await config.mutationFn(body);
    expect(authApi.login).toHaveBeenCalledWith(body);
  });

  it('useChangePassword calls authApi.changePassword', async () => {
    useChangePassword();
    const config = useMutationMock.mock.calls[0][0];
    const body = { current_password: 'old', new_password: 'new' };
    await config.mutationFn(body);
    expect(authApi.changePassword).toHaveBeenCalledWith(body);
  });

  it('useUpdateMe calls authApi.updateMe', async () => {
    useUpdateMe();
    const config = useMutationMock.mock.calls[0][0];
    const body = { full_name: 'A' };
    await config.mutationFn(body);
    expect(authApi.updateMe).toHaveBeenCalledWith(body);
  });
});

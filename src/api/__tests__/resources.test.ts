/* eslint-disable import/first -- jest.mock() factories must be hoisted above imports */
jest.mock('@/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import { apiClient } from '@/api/client';
import * as resources from '@/api/resources';

const get = apiClient.get as jest.Mock;
const post = apiClient.post as jest.Mock;
const put = apiClient.put as jest.Mock;
const del = apiClient.delete as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('resources', () => {
  it('creates an event', async () => {
    const body = { title: 'T', starts_at: '2026-01-01', location: 'L', capacity: 10 };
    post.mockResolvedValueOnce({ data: { id: 'e1' } });
    const result = await resources.createEventEventsPost(body as never);
    expect(post).toHaveBeenCalledWith('/events', body);
    expect(result).toEqual({ id: 'e1' });
  });

  it('lists events with optional pagination', async () => {
    get.mockResolvedValueOnce({ data: [{ id: 'e1' }] });
    const result = await resources.listEventsEventsGet('10', '0');
    expect(get).toHaveBeenCalledWith('/events', { params: { limit: '10', offset: '0' } });
    expect(result).toEqual([{ id: 'e1' }]);
  });

  it('gets a single event', async () => {
    get.mockResolvedValueOnce({ data: { id: 'e1' } });
    const result = await resources.getEventEventsEventIdGet('e1');
    expect(get).toHaveBeenCalledWith('/events/e1');
    expect(result).toEqual({ id: 'e1' });
  });

  it('updates an event', async () => {
    const body = { title: 'Updated' };
    put.mockResolvedValueOnce({ data: { id: 'e1' } });
    const result = await resources.updateEventEventsEventIdPut('e1', body as never);
    expect(put).toHaveBeenCalledWith('/events/e1', body);
    expect(result).toEqual({ id: 'e1' });
  });

  it('publishes an event', async () => {
    post.mockResolvedValueOnce({ data: { id: 'e1', status: 'published' } });
    const result = await resources.publishEventEventsEventIdPublishPost('e1');
    expect(post).toHaveBeenCalledWith('/events/e1/publish');
    expect(result).toEqual({ id: 'e1', status: 'published' });
  });

  it('cancels an event', async () => {
    post.mockResolvedValueOnce({ data: { id: 'e1', status: 'cancelled' } });
    const result = await resources.cancelEventEventsEventIdCancelPost('e1');
    expect(post).toHaveBeenCalledWith('/events/e1/cancel');
    expect(result).toEqual({ id: 'e1', status: 'cancelled' });
  });

  it('registers for an event', async () => {
    post.mockResolvedValueOnce({ data: { id: 'r1' } });
    const result = await resources.registerForEventEventsEventIdRegistrationsPost('e1');
    expect(post).toHaveBeenCalledWith('/events/e1/registrations');
    expect(result).toEqual({ id: 'r1' });
  });

  it('lists event registrations', async () => {
    get.mockResolvedValueOnce({ data: [{ id: 'r1' }] });
    const result = await resources.eventRegistrationsEventsEventIdRegistrationsGet('e1');
    expect(get).toHaveBeenCalledWith('/events/e1/registrations', { params: { limit: undefined, offset: undefined } });
    expect(result).toEqual([{ id: 'r1' }]);
  });

  it('lists my registrations', async () => {
    get.mockResolvedValueOnce({ data: [{ id: 'r1' }] });
    const result = await resources.myRegistrationsRegistrationsMeGet();
    expect(get).toHaveBeenCalledWith('/registrations/me');
    expect(result).toEqual([{ id: 'r1' }]);
  });

  it('cancels a registration', async () => {
    del.mockResolvedValueOnce({ data: undefined });
    await resources.cancelRegistrationRegistrationsRegIdDelete('r1');
    expect(del).toHaveBeenCalledWith('/registrations/r1');
  });

  it('lists event waitlist', async () => {
    get.mockResolvedValueOnce({ data: [{ id: 'w1' }] });
    const result = await resources.eventWaitlistEventsEventIdWaitlistGet('e1');
    expect(get).toHaveBeenCalledWith('/events/e1/waitlist', { params: { limit: undefined, offset: undefined } });
    expect(result).toEqual([{ id: 'w1' }]);
  });

  it('lists notification jobs', async () => {
    get.mockResolvedValueOnce({ data: [{ id: 'n1' }] });
    const result = await resources.listNotificationJobsNotificationJobsGet();
    expect(get).toHaveBeenCalledWith('/notification-jobs', { params: { event_id: undefined, limit: undefined, offset: undefined } });
    expect(result).toEqual([{ id: 'n1' }]);
  });

  it('gets a notification job', async () => {
    get.mockResolvedValueOnce({ data: { id: 'n1' } });
    const result = await resources.getNotificationJobNotificationJobsJobIdGet('n1');
    expect(get).toHaveBeenCalledWith('/notification-jobs/n1');
    expect(result).toEqual({ id: 'n1' });
  });

  it('registers a device', async () => {
    const body = { expo_push_token: 'token', platform: 'android' as const };
    post.mockResolvedValueOnce({ data: { id: 'd1' } });
    const result = await resources.registerDeviceDevicesRegisterPost(body);
    expect(post).toHaveBeenCalledWith('/devices/register', body);
    expect(result).toEqual({ id: 'd1' });
  });

  it('unregisters a device', async () => {
    const body = { expo_push_token: 'token' };
    post.mockResolvedValueOnce({ data: undefined });
    await resources.unregisterDeviceDevicesUnregisterPost(body);
    expect(post).toHaveBeenCalledWith('/devices/unregister', body);
  });

  it('gets organizer stats', async () => {
    get.mockResolvedValueOnce({ data: { events_total: 1 } });
    const result = await resources.getStatsStatsGet();
    expect(get).toHaveBeenCalledWith('/stats');
    expect(result).toEqual({ events_total: 1 });
  });

  it('flushes the rate limit', async () => {
    del.mockResolvedValueOnce({ data: undefined });
    await resources.flushRatelimitInternalFlushRatelimitDelete();
    expect(del).toHaveBeenCalledWith('/internal/flush-ratelimit');
  });

  it('checks health', async () => {
    get.mockResolvedValueOnce({ data: { status: 'ok' } });
    const result = await resources.healthHealthGet();
    expect(get).toHaveBeenCalledWith('/health');
    expect(result).toEqual({ status: 'ok' });
  });

  it('checks readiness', async () => {
    get.mockResolvedValueOnce({ data: { status: 'ok' } });
    const result = await resources.readyReadyGet();
    expect(get).toHaveBeenCalledWith('/ready');
    expect(result).toEqual({ status: 'ok' });
  });
});

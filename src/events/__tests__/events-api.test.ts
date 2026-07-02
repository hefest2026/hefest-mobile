/* eslint-disable import/first -- jest.mock() factories must be hoisted above imports */
jest.mock('@/api/client', () => ({
  apiClient: { get: jest.fn() },
}));

import { apiClient } from '@/api/client';
import { getEvent, listEvents } from '@/events/events-api';

const get = apiClient.get as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('events-api', () => {
  it('listEvents sends limit/offset and returns the array', async () => {
    get.mockResolvedValueOnce({ data: [{ id: 'e1' }] });
    const result = await listEvents(50, 0);
    expect(get).toHaveBeenCalledWith('/events', { params: { limit: 50, offset: 0 } });
    expect(result).toEqual([{ id: 'e1' }]);
  });

  it('getEvent fetches the detail by id', async () => {
    get.mockResolvedValueOnce({ data: { id: 'e1', waitlist_count: 2 } });
    const result = await getEvent('e1');
    expect(get).toHaveBeenCalledWith('/events/e1');
    expect(result).toEqual({ id: 'e1', waitlist_count: 2 });
  });
});

import { AxiosError, type AxiosAdapter, type AxiosResponse } from 'axios';

import { apiClient, runRefresh, setHardLogoutHandler } from '@/api/client';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '@/auth/token-store';
import type { TokenResponse } from '@/types/auth';

const ROTATED: TokenResponse = {
  access_token: 'access-2',
  token_type: 'bearer',
  expires_in: 900,
  refresh_token: 'refresh-2',
};

function ok(config: Parameters<AxiosAdapter>[0], data: unknown): AxiosResponse {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
    request: {},
  } as AxiosResponse;
}

/**
 * Reject like a real adapter would for a 401. Custom adapters must reject
 * themselves (axios only runs `settle`/`validateStatus` inside its built-ins).
 */
function reject401(
  config: Parameters<AxiosAdapter>[0],
  headers: Record<string, string> = {},
): Promise<never> {
  const response = {
    data: { detail: 'unauthorized' },
    status: 401,
    statusText: 'Unauthorized',
    headers,
    config,
    request: {},
  } as AxiosResponse;
  return Promise.reject(
    new AxiosError('Request failed with status code 401', 'ERR_BAD_REQUEST', config, {}, response),
  );
}

/** Install a routing adapter on the shared client. */
function useAdapter(adapter: AxiosAdapter): void {
  apiClient.defaults.adapter = adapter;
}

beforeEach(async () => {
  jest.clearAllMocks();
  setHardLogoutHandler(null);
  await clearTokens();
});

describe('runRefresh', () => {
  it('hard-logs-out when no refresh token is stored', async () => {
    const onHardLogout = jest.fn();
    setHardLogoutHandler(onHardLogout);
    useAdapter(async (c) => ok(c, {}));

    expect(await runRefresh()).toBe(false);
    expect(onHardLogout).toHaveBeenCalledTimes(1);
  });

  it('rotates and persists tokens on success', async () => {
    await setRefreshToken('refresh-1');
    useAdapter(async (c) => ok(c, ROTATED));

    expect(await runRefresh()).toBe(true);
    expect(getAccessToken()).toBe('access-2');
    expect(await getRefreshToken()).toBe('refresh-2');
  });

  it('coalesces concurrent calls into a single refresh round-trip', async () => {
    await setRefreshToken('refresh-1');
    const adapter = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(
      async (c) => ok(c, ROTATED),
    );
    useAdapter(adapter);

    const [a, b] = await Promise.all([runRefresh(), runRefresh()]);
    expect(a).toBe(true);
    expect(b).toBe(true);
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it('hard-logs-out when the refresh request fails', async () => {
    await setRefreshToken('refresh-1');
    const onHardLogout = jest.fn();
    setHardLogoutHandler(onHardLogout);
    useAdapter(async (c) => reject401(c));

    expect(await runRefresh()).toBe(false);
    expect(onHardLogout).toHaveBeenCalledTimes(1);
    expect(await getRefreshToken()).toBeNull();
  });
});

describe('response interceptor 401 safety net', () => {
  it('refreshes once and retries the original request transparently', async () => {
    setAccessToken('access-1', 900); // valid → no preemptive refresh
    await setRefreshToken('refresh-1');

    let meCalls = 0;
    useAdapter(async (config) => {
      if (config.url === '/auth/refresh') {
        return ok(config, ROTATED);
      }
      if (config.url === '/users/me') {
        meCalls += 1;
        if (meCalls === 1) {
          return reject401(config); // first hit
        }
        // retry must carry the rotated bearer
        expect(config.headers?.Authorization).toBe('Bearer access-2');
        return ok(config, { id: 'u1' });
      }
      return ok(config, {});
    });

    const { data } = await apiClient.get('/users/me');
    expect(data).toEqual({ id: 'u1' });
    expect(meCalls).toBe(2);
  });

  it('hard-logs-out on token_reuse_detected without retrying', async () => {
    setAccessToken('access-1', 900);
    await setRefreshToken('refresh-1');
    const onHardLogout = jest.fn();
    setHardLogoutHandler(onHardLogout);

    let meCalls = 0;
    useAdapter(async (config) => {
      meCalls += 1;
      return reject401(config, { 'x-error-code': 'token_reuse_detected' });
    });

    await expect(apiClient.get('/users/me')).rejects.toBeDefined();
    expect(onHardLogout).toHaveBeenCalledTimes(1);
    expect(meCalls).toBe(1); // no retry
  });
});

describe('request interceptor preemptive refresh', () => {
  it('refreshes before sending when the access token is absent', async () => {
    await setRefreshToken('refresh-1');
    let refreshed = false;
    useAdapter(async (config) => {
      if (config.url === '/auth/refresh') {
        refreshed = true;
        return ok(config, ROTATED);
      }
      expect(config.headers?.Authorization).toBe('Bearer access-2');
      return ok(config, { id: 'u1' });
    });

    await apiClient.get('/users/me');
    expect(refreshed).toBe(true);
  });
});

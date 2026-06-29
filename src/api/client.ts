/**
 * The single axios instance for the app. Its interceptors own *all* token
 * mechanics — preemptive refresh, the shared in-flight refresh promise, the
 * 401 safety net, and hard logout. Nothing above this layer touches tokens.
 */

import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

import { API_BASE_URL, CLIENT_ID, CLIENT_ID_HEADER } from '@/api/config';
import { isHardLogoutCode } from '@/auth/errors';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpired,
  persistTokens,
  setRefreshToken,
} from '@/auth/token-store';
import type { TokenResponse } from '@/types/auth';

/** Extra per-request flags understood by the interceptors. */
type AuthRequestConfig = InternalAxiosRequestConfig & {
  /** Skip Bearer attachment + refresh handling (auth endpoints themselves). */
  skipAuth?: boolean;
  /** Internal: marks a request already retried once after a 401. */
  _retried?: boolean;
};

const baseHeaders = { [CLIENT_ID_HEADER]: CLIENT_ID };

// eslint-disable-next-line import/no-named-as-default-member -- axios.create is the documented factory
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: baseHeaders,
});

/** Notifies the session layer that the held session is no longer valid. */
type HardLogoutHandler = () => void;
let onHardLogout: HardLogoutHandler | null = null;

export function setHardLogoutHandler(handler: HardLogoutHandler | null): void {
  onHardLogout = handler;
}

let refreshPromise: Promise<boolean> | null = null;

/**
 * Run a single shared token refresh. Concurrent callers await the same promise,
 * so a burst of expired/401 requests triggers exactly one refresh round-trip.
 *
 * @returns `true` when a new access token is available, `false` after a hard
 *   logout (no refresh token, reuse detected, or refresh failure).
 */
export function runRefresh(): Promise<boolean> {
  if (refreshPromise === null) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function performRefresh(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (refreshToken === null) {
    await hardLogout();
    return false;
  }
  try {
    // `skipAuth` makes both interceptors no-op for this call, so a failing
    // refresh can't recurse into itself.
    const { data } = await apiClient.post<TokenResponse>(
      '/auth/refresh',
      { refresh_token: refreshToken },
      { skipAuth: true },
    );
    await persistTokens(data);
    // Rotation: the new refresh token must replace the stored one. When the
    // backend omits it (shouldn't for mobile), keep the existing token.
    if (data.refresh_token !== null) {
      await setRefreshToken(data.refresh_token);
    }
    return true;
  } catch {
    // Any refresh failure (incl. token_reuse_detected) is a hard logout.
    await hardLogout();
    return false;
  }
}

async function hardLogout(): Promise<void> {
  await clearTokens();
  onHardLogout?.();
}

apiClient.interceptors.request.use(async (config: AuthRequestConfig) => {
  if (config.skipAuth === true) {
    return config;
  }
  // Preemptive refresh: if the access token is missing/near expiry and we hold
  // a refresh token, refresh before sending so the request carries a fresh one.
  if (isAccessTokenExpired() && (await getRefreshToken()) !== null) {
    await runRefresh();
  }
  const access = getAccessToken();
  if (access !== null) {
    config.headers.set('Authorization', `Bearer ${access}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as AuthRequestConfig | undefined;
    const status = error.response?.status;
    if (
      config === undefined ||
      status !== 401 ||
      config.skipAuth === true ||
      config._retried === true
    ) {
      return Promise.reject(error);
    }
    // token_reuse_detected: do not retry, force a clean re-login.
    const errorCode = error.response?.headers?.['x-error-code'];
    if (isHardLogoutCode(errorCode)) {
      await hardLogout();
      return Promise.reject(error);
    }
    config._retried = true;
    const refreshed = await runRefresh();
    if (!refreshed) {
      return Promise.reject(error);
    }
    const access = getAccessToken();
    if (access !== null) {
      config.headers.set('Authorization', `Bearer ${access}`);
    }
    return apiClient(config);
  },
);

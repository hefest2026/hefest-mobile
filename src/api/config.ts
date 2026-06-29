/**
 * Runtime API configuration. The base URL is supplied via the public
 * `EXPO_PUBLIC_API_URL` env var (inlined at build time) and falls back to the
 * local dev backend.
 */

export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

/**
 * Client identifier the backend uses to decide refresh-token delivery: mobile
 * receives the refresh token in the response body, web uses an httpOnly cookie.
 */
export const CLIENT_ID = 'mobile_app' as const;
export const CLIENT_ID_HEADER = 'X-Client-Id' as const;
export const ERROR_CODE_HEADER = 'X-Error-Code' as const;

/**
 * Seconds subtracted from an access token's lifetime so it is refreshed
 * slightly before it actually expires, absorbing clock skew + request latency.
 */
export const REFRESH_SKEW_SECONDS = 30;

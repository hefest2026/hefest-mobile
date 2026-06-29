/**
 * Token persistence for the mobile session.
 *
 * - Refresh token: durable, in `expo-secure-store` (survives cold starts).
 * - Access token + its absolute expiry: in-memory only, never persisted. On a
 *   cold start there is no access token, so bootstrap always derives one from
 *   the stored refresh token.
 */

import * as SecureStore from 'expo-secure-store';

import { REFRESH_SKEW_SECONDS } from '@/api/config';
import type { TokenResponse } from '@/types/auth';

const REFRESH_TOKEN_KEY = 'hefest_refresh_token';

type AccessState = {
  token: string;
  /** Absolute expiry as epoch milliseconds. */
  expiresAtMs: number;
};

let accessState: AccessState | null = null;

/** Current in-memory access token, or `null` when absent. */
export function getAccessToken(): string | null {
  return accessState?.token ?? null;
}

/**
 * Whether the in-memory access token is missing or within the skew window of
 * expiring, i.e. a refresh is needed before using it.
 *
 * @param now - Current time in epoch milliseconds (injectable for testing).
 */
export function isAccessTokenExpired(now: number = Date.now()): boolean {
  if (accessState === null) {
    return true;
  }
  return now >= accessState.expiresAtMs - REFRESH_SKEW_SECONDS * 1000;
}

/**
 * Store the access token in memory, computing its absolute expiry from the
 * `expires_in` lifetime (seconds).
 */
export function setAccessToken(
  token: string,
  expiresInSeconds: number,
  now: number = Date.now(),
): void {
  accessState = { token, expiresAtMs: now + expiresInSeconds * 1000 };
}

/** Read the durable refresh token from secure storage. */
export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

/** Persist the durable refresh token to secure storage. */
export async function setRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

/**
 * Persist a fresh `TokenResponse`: access token into memory, and the refresh
 * token (when present) into secure storage.
 */
export async function persistTokens(
  tokens: TokenResponse,
  now: number = Date.now(),
): Promise<void> {
  setAccessToken(tokens.access_token, tokens.expires_in, now);
  if (tokens.refresh_token !== null) {
    await setRefreshToken(tokens.refresh_token);
  }
}

/** Wipe both the in-memory access token and the stored refresh token. */
export async function clearTokens(): Promise<void> {
  accessState = null;
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

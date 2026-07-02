import * as SecureStore from 'expo-secure-store';

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpired,
  persistTokens,
  setAccessToken,
  setRefreshToken,
} from '@/auth/token-store';
import type { TokenResponse } from '@/types/auth';

beforeEach(async () => {
  jest.clearAllMocks();
  await clearTokens();
});

describe('access token (in-memory) + expiry', () => {
  it('is reported expired when absent', () => {
    expect(getAccessToken()).toBeNull();
    expect(isAccessTokenExpired()).toBe(true);
  });

  it('honours the skew window', () => {
    const now = 1_000_000;
    setAccessToken('abc', 100, now); // expires at now + 100s
    expect(getAccessToken()).toBe('abc');
    // 50s in: still valid (skew is 30s).
    expect(isAccessTokenExpired(now + 50_000)).toBe(false);
    // 75s in: inside the 30s skew window → treated as expired.
    expect(isAccessTokenExpired(now + 75_000)).toBe(true);
  });
});

describe('refresh token (secure store)', () => {
  it('persists and reads back', async () => {
    await setRefreshToken('refresh-1');
    expect(await getRefreshToken()).toBe('refresh-1');
    expect(SecureStore.setItemAsync).toHaveBeenCalled();
  });
});

describe('persistTokens', () => {
  it('stores access in memory and refresh in secure store', async () => {
    const tokens: TokenResponse = {
      access_token: 'access-1',
      token_type: 'bearer',
      expires_in: 900,
      refresh_token: 'refresh-1',
    };
    await persistTokens(tokens, 0);
    expect(getAccessToken()).toBe('access-1');
    expect(await getRefreshToken()).toBe('refresh-1');
  });

  it('keeps the existing refresh token when the response omits one', async () => {
    await setRefreshToken('keep-me');
    await persistTokens(
      { access_token: 'a', token_type: 'bearer', expires_in: 900, refresh_token: null },
      0,
    );
    expect(await getRefreshToken()).toBe('keep-me');
  });
});

describe('clearTokens', () => {
  it('wipes both stores', async () => {
    await persistTokens(
      { access_token: 'a', token_type: 'bearer', expires_in: 900, refresh_token: 'r' },
      0,
    );
    await clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(await getRefreshToken()).toBeNull();
  });
});

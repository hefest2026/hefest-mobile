/**
 * SSO (Google / Microsoft) via the system browser. The API callback redirects
 * to `hefestmobile://auth/callback#access_token=…&refresh_token=…` (HEF-47);
 * we parse that fragment and feed the tokens through the same persistence path
 * as password login.
 */

import * as WebBrowser from 'expo-web-browser';

import { API_BASE_URL } from '@/api/config';
import type { TokenResponse } from '@/types/auth';

export const SSO_REDIRECT_URL = 'hefestmobile://auth/callback';

/** Default access-token lifetime (seconds) when a JWT carries no `exp`. */
const DEFAULT_EXPIRES_IN = 900;

/** Decode a JWT's `exp` claim into a remaining lifetime in seconds. */
function expiresInFromJwt(token: string, now: number = Date.now()): number {
  const segments = token.split('.');
  if (segments.length < 2) {
    return DEFAULT_EXPIRES_IN;
  }
  try {
    const payload = JSON.parse(
      // Base64url → base64 then decode.
      Buffer.from(
        segments[1].replace(/-/g, '+').replace(/_/g, '/'),
        'base64',
      ).toString('utf8'),
    ) as { exp?: number };
    if (typeof payload.exp === 'number') {
      const remaining = payload.exp - Math.floor(now / 1000);
      return remaining > 0 ? remaining : DEFAULT_EXPIRES_IN;
    }
  } catch {
    // Malformed payload — fall through to default.
  }
  return DEFAULT_EXPIRES_IN;
}

/**
 * Parse the `#access_token=…&refresh_token=…` fragment from an SSO callback URL
 * into a `TokenResponse`. Returns `null` when the access token is absent.
 */
export function parseAuthCallback(
  url: string,
  now: number = Date.now(),
): TokenResponse | null {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) {
    return null;
  }
  const params = new URLSearchParams(url.slice(hashIndex + 1));
  const accessToken = params.get('access_token');
  if (accessToken === null || accessToken === '') {
    return null;
  }
  return {
    access_token: accessToken,
    token_type: 'bearer',
    expires_in: expiresInFromJwt(accessToken, now),
    refresh_token: params.get('refresh_token'),
  };
}

/**
 * Launch the SSO flow for a provider and resolve with the parsed tokens, or
 * `null` if the user cancelled / the round-trip produced no usable token.
 */
export async function startSsoFlow(
  providerId: string,
): Promise<TokenResponse | null> {
  const authUrl = `${API_BASE_URL}/auth/${providerId}/login`;
  const result = await WebBrowser.openAuthSessionAsync(authUrl, SSO_REDIRECT_URL);
  if (result.type !== 'success') {
    return null;
  }
  return parseAuthCallback(result.url);
}

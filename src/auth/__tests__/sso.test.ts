import * as WebBrowser from 'expo-web-browser';

import { parseAuthCallback, startSsoFlow } from '@/auth/sso';

const openAuthSessionAsync = WebBrowser.openAuthSessionAsync as jest.Mock;

/** Build a JWT-ish token whose payload carries `exp`. */
function jwtWithExp(expSeconds: number): string {
  const payload = Buffer.from(JSON.stringify({ exp: expSeconds })).toString('base64url');
  return `header.${payload}.sig`;
}

describe('parseAuthCallback', () => {
  it('returns null when there is no fragment', () => {
    expect(parseAuthCallback('hefestmobile://auth/callback')).toBeNull();
  });

  it('returns null for an empty fragment', () => {
    expect(parseAuthCallback('hefestmobile://auth/callback#')).toBeNull();
  });

  it('returns null when access_token is missing', () => {
    expect(parseAuthCallback('hefestmobile://auth/callback#refresh_token=r')).toBeNull();
  });

  it('parses access + refresh tokens', () => {
    const tokens = parseAuthCallback(
      'hefestmobile://auth/callback#access_token=abc&refresh_token=xyz',
    );
    expect(tokens).not.toBeNull();
    expect(tokens?.access_token).toBe('abc');
    expect(tokens?.refresh_token).toBe('xyz');
    expect(tokens?.token_type).toBe('bearer');
  });

  it('tolerates a trailing-slash path before the fragment', () => {
    const tokens = parseAuthCallback(
      'hefestmobile://auth/callback/#access_token=abc',
    );
    expect(tokens?.access_token).toBe('abc');
    expect(tokens?.refresh_token).toBeNull();
  });

  it('derives expires_in from a JWT exp claim', () => {
    const now = 1_000_000_000_000; // ms
    const token = jwtWithExp(Math.floor(now / 1000) + 600);
    const tokens = parseAuthCallback(`x://c#access_token=${token}`, now);
    expect(tokens?.expires_in).toBe(600);
  });

  it('falls back to a default lifetime for a non-JWT token', () => {
    const tokens = parseAuthCallback('x://c#access_token=opaque', 0);
    expect(tokens?.expires_in).toBeGreaterThan(0);
  });
});

describe('startSsoFlow', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns null when the browser session is cancelled', async () => {
    openAuthSessionAsync.mockResolvedValueOnce({ type: 'cancel' });
    expect(await startSsoFlow('google')).toBeNull();
  });

  it('returns parsed tokens on success', async () => {
    openAuthSessionAsync.mockResolvedValueOnce({
      type: 'success',
      url: 'hefestmobile://auth/callback#access_token=abc&refresh_token=xyz',
    });
    const tokens = await startSsoFlow('google');
    expect(tokens?.access_token).toBe('abc');
    expect(openAuthSessionAsync).toHaveBeenCalledWith(
      expect.stringContaining('/auth/google/login'),
      'hefestmobile://auth/callback',
    );
  });
});

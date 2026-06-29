/* eslint-disable import/first -- jest.mock() factories must be hoisted above imports */
jest.mock('@/api/client', () => ({
  apiClient: { post: jest.fn(), get: jest.fn() },
}));

import { apiClient } from '@/api/client';
import {
  fetchMe,
  fetchProviders,
  login,
  logout,
  register,
  verifyEmail,
} from '@/auth/auth-api';

const post = apiClient.post as jest.Mock;
const get = apiClient.get as jest.Mock;

const SKIP = { skipAuth: true };

beforeEach(() => jest.clearAllMocks());

describe('auth-api', () => {
  it('register posts the body with skipAuth and returns data', async () => {
    post.mockResolvedValueOnce({ data: { message: 'ok', verify_token: 't' } });
    const body = { full_name: 'Ada', email: 'a@b.com', password: 'x'.repeat(12) };
    const result = await register(body);
    expect(post).toHaveBeenCalledWith('/register', body, SKIP);
    expect(result.verify_token).toBe('t');
  });

  it('verifyEmail wraps the token', async () => {
    post.mockResolvedValueOnce({ data: { access_token: 'a' } });
    await verifyEmail('tok');
    expect(post).toHaveBeenCalledWith('/auth/verify-email', { token: 'tok' }, SKIP);
  });

  it('login posts credentials with skipAuth', async () => {
    post.mockResolvedValueOnce({ data: { access_token: 'a' } });
    await login({ email: 'a@b.com', password: 'pw' });
    expect(post).toHaveBeenCalledWith('/login', { email: 'a@b.com', password: 'pw' }, SKIP);
  });

  it('logout sends the refresh token', async () => {
    post.mockResolvedValueOnce({ data: undefined });
    await logout('refresh-1');
    expect(post).toHaveBeenCalledWith('/auth/logout', { refresh_token: 'refresh-1' }, SKIP);
  });

  it('fetchMe gets the profile (authenticated)', async () => {
    get.mockResolvedValueOnce({ data: { id: 'u1' } });
    const me = await fetchMe();
    expect(get).toHaveBeenCalledWith('/users/me');
    expect(me).toEqual({ id: 'u1' });
  });

  it('fetchProviders gets the provider list with skipAuth', async () => {
    get.mockResolvedValueOnce({ data: { password: { available: true }, providers: [] } });
    await fetchProviders();
    expect(get).toHaveBeenCalledWith('/auth/providers', SKIP);
  });
});

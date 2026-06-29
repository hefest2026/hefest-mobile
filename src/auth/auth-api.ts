/**
 * Typed wrappers over the hefest-api auth endpoints. Auth endpoints that
 * establish a session (`register`, `verify-email`, `login`) are marked
 * `skipAuth` so the interceptors don't try to attach/refresh a Bearer token
 * the caller doesn't have yet.
 */

import { apiClient } from '@/api/client';
import type {
  LoginRequest,
  ProvidersResponse,
  RegisterRequest,
  RegisterResponse,
  TokenResponse,
  UserMe,
} from '@/types/auth';

const SKIP_AUTH = { skipAuth: true } as const;

export async function register(
  body: RegisterRequest,
): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>(
    '/register',
    body,
    SKIP_AUTH,
  );
  return data;
}

export async function verifyEmail(token: string): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>(
    '/auth/verify-email',
    { token },
    SKIP_AUTH,
  );
  return data;
}

export async function login(body: LoginRequest): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>(
    '/login',
    body,
    SKIP_AUTH,
  );
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refresh_token: refreshToken }, SKIP_AUTH);
}

export async function fetchMe(): Promise<UserMe> {
  const { data } = await apiClient.get<UserMe>('/users/me');
  return data;
}

export async function fetchProviders(): Promise<ProvidersResponse> {
  const { data } = await apiClient.get<ProvidersResponse>(
    '/auth/providers',
    SKIP_AUTH,
  );
  return data;
}

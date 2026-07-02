/* eslint-disable import/first -- jest.mock() factories must be hoisted above imports */
jest.mock('@/api/client', () => ({
  runRefresh: jest.fn(),
  setHardLogoutHandler: jest.fn(),
}));
jest.mock('@/api/query-client', () => ({
  queryClient: { clear: jest.fn() },
}));
jest.mock('@/auth/auth-api', () => ({
  register: jest.fn(),
  verifyEmail: jest.fn(),
  login: jest.fn(),
  fetchMe: jest.fn(),
  logout: jest.fn(),
}));
jest.mock('@/auth/sso', () => ({
  startSsoFlow: jest.fn(),
}));
jest.mock('@/auth/token-store', () => ({
  clearTokens: jest.fn(),
  getRefreshToken: jest.fn(),
  persistTokens: jest.fn(),
}));

import { act, render, renderHook, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import { runRefresh, setHardLogoutHandler } from '@/api/client';
import { queryClient } from '@/api/query-client';
import * as authApi from '@/auth/auth-api';
import { AuthProvider, useAuth } from '@/auth/auth-context';
import { startSsoFlow } from '@/auth/sso';
import * as tokenStore from '@/auth/token-store';
import type { TokenResponse, UserMe } from '@/types/auth';

const runRefreshMock = runRefresh as jest.Mock;
const getRefreshTokenMock = tokenStore.getRefreshToken as jest.Mock;
const fetchMeMock = authApi.fetchMe as jest.Mock;
const loginMock = authApi.login as jest.Mock;
const registerMock = authApi.register as jest.Mock;
const verifyEmailMock = authApi.verifyEmail as jest.Mock;
const startSsoFlowMock = startSsoFlow as jest.Mock;
const logoutMock = authApi.logout as jest.Mock;

const TOKENS: TokenResponse = {
  access_token: 'access-1',
  token_type: 'bearer',
  expires_in: 900,
  refresh_token: 'refresh-1',
};

const USER: UserMe = {
  id: 'u1',
  email: 'a@b.com',
  full_name: 'Ada',
  role: 'student',
};

function Wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

beforeEach(() => {
  jest.clearAllMocks();
  getRefreshTokenMock.mockResolvedValue(null);
  runRefreshMock.mockResolvedValue(false);
});

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');
  });
});

describe('AuthProvider bootstrap', () => {
  it('starts in bootstrapping then becomes signedOut without a refresh token', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });
    expect(result.current.status).toBe('bootstrapping');

    await waitFor(() => expect(result.current.status).toBe('signedOut'));
  });

  it('bootstraps into signedIn when a stored refresh token refreshes', async () => {
    getRefreshTokenMock.mockResolvedValue('refresh-1');
    runRefreshMock.mockResolvedValue(true);
    fetchMeMock.mockResolvedValue(USER);

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.status).toBe('signedIn'));
    expect(result.current.user).toEqual(USER);
  });

  it('falls back to signedOut when refresh succeeds but /users/me fails', async () => {
    getRefreshTokenMock.mockResolvedValue('refresh-1');
    runRefreshMock.mockResolvedValue(true);
    fetchMeMock.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.status).toBe('signedOut'));
    expect(queryClient.clear).toHaveBeenCalled();
  });
});

describe('AuthProvider actions', () => {
  it('login persists tokens and completes sign in', async () => {
    getRefreshTokenMock.mockResolvedValue(null);
    loginMock.mockResolvedValue(TOKENS);
    fetchMeMock.mockResolvedValue(USER);

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.status).toBe('signedOut'));

    await act(async () => {
      await result.current.login({ email: 'a@b.com', password: 'pw' });
    });

    expect(tokenStore.persistTokens).toHaveBeenCalledWith(TOKENS);
    expect(result.current.status).toBe('signedIn');
    expect(result.current.user).toEqual(USER);
  });

  it('verify persists tokens and completes sign in', async () => {
    getRefreshTokenMock.mockResolvedValue(null);
    verifyEmailMock.mockResolvedValue(TOKENS);
    fetchMeMock.mockResolvedValue(USER);

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.status).toBe('signedOut'));

    await act(async () => {
      await result.current.verify('tok');
    });

    expect(tokenStore.persistTokens).toHaveBeenCalledWith(TOKENS);
    expect(result.current.status).toBe('signedIn');
  });

  it('register delegates to authApi.register', async () => {
    getRefreshTokenMock.mockResolvedValue(null);
    registerMock.mockResolvedValue({ verify_token: 'tok' });

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.status).toBe('signedOut'));

    const body = { email: 'a@b.com', password: 'pw', full_name: 'Ada' };
    const response = await act(async () => result.current.register(body));

    expect(registerMock).toHaveBeenCalledWith(body);
    expect(response).toEqual({ verify_token: 'tok' });
  });

  it('loginWithSso returns false when SSO is cancelled', async () => {
    getRefreshTokenMock.mockResolvedValue(null);
    startSsoFlowMock.mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.status).toBe('signedOut'));

    const ok = await act(async () => result.current.loginWithSso('google'));
    expect(ok).toBe(false);
  });

  it('loginWithSso completes sign in on success', async () => {
    getRefreshTokenMock.mockResolvedValue(null);
    startSsoFlowMock.mockResolvedValue(TOKENS);
    fetchMeMock.mockResolvedValue(USER);

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.status).toBe('signedOut'));

    const ok = await act(async () => result.current.loginWithSso('google'));
    expect(ok).toBe(true);
    expect(tokenStore.persistTokens).toHaveBeenCalledWith(TOKENS);
    expect(result.current.status).toBe('signedIn');
  });

  it('logout clears tokens and signs out', async () => {
    getRefreshTokenMock.mockResolvedValue('refresh-1');
    runRefreshMock.mockResolvedValue(true);
    fetchMeMock.mockResolvedValue(USER);
    logoutMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.status).toBe('signedIn'));

    await act(async () => {
      await result.current.logout();
    });

    expect(logoutMock).toHaveBeenCalledWith('refresh-1');
    expect(tokenStore.clearTokens).toHaveBeenCalled();
    expect(result.current.status).toBe('signedOut');
  });

  it('logout still signs out when server logout fails', async () => {
    getRefreshTokenMock.mockResolvedValue('refresh-1');
    runRefreshMock.mockResolvedValue(true);
    fetchMeMock.mockResolvedValue(USER);
    logoutMock.mockRejectedValue(new Error('offline'));

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.status).toBe('signedIn'));

    await act(async () => {
      await result.current.logout();
    });

    expect(tokenStore.clearTokens).toHaveBeenCalled();
    expect(result.current.status).toBe('signedOut');
  });
});

describe('AuthProvider hard logout wiring', () => {
  it('registers a hard-logout handler on mount', async () => {
    render(
      <AuthProvider>
        <Text>child</Text>
      </AuthProvider>,
    );
    await waitFor(() => expect(setHardLogoutHandler).toHaveBeenCalled());
  });
});

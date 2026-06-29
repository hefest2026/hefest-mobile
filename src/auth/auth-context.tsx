/**
 * Session context. Owns the high-level auth state machine
 * (`bootstrapping | signedOut | signedIn`) and exposes the actions screens use.
 * Token mechanics live below this in the axios interceptors; this layer only
 * reacts to their outcome (including hard logout).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { runRefresh, setHardLogoutHandler } from '@/api/client';
import { queryClient } from '@/api/query-client';
import * as authApi from '@/auth/auth-api';
import { startSsoFlow } from '@/auth/sso';
import {
  clearTokens,
  getRefreshToken,
  persistTokens,
} from '@/auth/token-store';
import type {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  UserMe,
} from '@/types/auth';

export type SessionStatus = 'bootstrapping' | 'signedOut' | 'signedIn';

export type AuthContextValue = {
  status: SessionStatus;
  user: UserMe | null;
  register: (body: RegisterRequest) => Promise<RegisterResponse>;
  verify: (token: string) => Promise<void>;
  login: (body: LoginRequest) => Promise<void>;
  loginWithSso: (providerId: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('bootstrapping');
  const [user, setUser] = useState<UserMe | null>(null);
  // Avoids a hard-logout callback updating state after unmount.
  const mounted = useRef(true);

  const enterSignedOut = useCallback(() => {
    if (!mounted.current) {
      return;
    }
    setUser(null);
    setStatus('signedOut');
    queryClient.clear();
  }, []);

  const completeSignIn = useCallback(async () => {
    const me = await authApi.fetchMe();
    if (!mounted.current) {
      return;
    }
    setUser(me);
    setStatus('signedIn');
  }, []);

  // Register the hard-logout handler so interceptor-driven session loss
  // (reuse detection / refresh failure) flips the UI to signed out.
  useEffect(() => {
    mounted.current = true;
    setHardLogoutHandler(enterSignedOut);
    return () => {
      mounted.current = false;
      setHardLogoutHandler(null);
    };
  }, [enterSignedOut]);

  // Cold-start bootstrap: derive a session from the stored refresh token.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const refreshToken = await getRefreshToken();
      if (refreshToken === null) {
        if (!cancelled) {
          enterSignedOut();
        }
        return;
      }
      const refreshed = await runRefresh();
      if (cancelled) {
        return;
      }
      if (refreshed) {
        try {
          await completeSignIn();
        } catch {
          enterSignedOut();
        }
      } else {
        enterSignedOut();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enterSignedOut, completeSignIn]);

  const register = useCallback(
    (body: RegisterRequest) => authApi.register(body),
    [],
  );

  const verify = useCallback(
    async (token: string) => {
      const tokens = await authApi.verifyEmail(token);
      await persistTokens(tokens);
      await completeSignIn();
    },
    [completeSignIn],
  );

  const login = useCallback(
    async (body: LoginRequest) => {
      const tokens = await authApi.login(body);
      await persistTokens(tokens);
      await completeSignIn();
    },
    [completeSignIn],
  );

  const loginWithSso = useCallback(
    async (providerId: string) => {
      const tokens = await startSsoFlow(providerId);
      if (tokens === null) {
        return false;
      }
      await persistTokens(tokens);
      await completeSignIn();
      return true;
    },
    [completeSignIn],
  );

  const logout = useCallback(async () => {
    const refreshToken = await getRefreshToken();
    if (refreshToken !== null) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Best-effort server revoke; local wipe proceeds regardless.
      }
    }
    await clearTokens();
    enterSignedOut();
  }, [enterSignedOut]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, register, verify, login, loginWithSso, logout }),
    [status, user, register, verify, login, loginWithSso, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

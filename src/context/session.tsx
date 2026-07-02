import * as React from 'react';

import type { Role } from '@/lib/types';

interface User {
  name: string;
  email: string;
  initials: string;
}

interface SessionState {
  user: User | null;
  role: Role | null;
  currentStudentId: string;
  signIn: () => void;
  selectRole: (role: Role) => void;
  signOut: () => void;
}

const MOCK_USER: User = {
  name: 'Иван Петров',
  email: 'ivan.petrov@example.com',
  initials: 'ИП',
};

const SessionContext = React.createContext<SessionState | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [role, setRole] = React.useState<Role | null>(null);

  const signIn = React.useCallback(() => setUser(MOCK_USER), []);
  const selectRole = React.useCallback((next: Role) => setRole(next), []);
  const signOut = React.useCallback(() => {
    setUser(null);
    setRole(null);
  }, []);

  const value = React.useMemo<SessionState>(
    () => ({
      user,
      role,
      currentStudentId: 'student-123',
      signIn,
      selectRole,
      signOut,
    }),
    [user, role, signIn, selectRole, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  const ctx = React.useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}

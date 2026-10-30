import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { adminApi, loadToken, request, saveToken } from '@/lib/api';

type AdminUser = { id: number; name: string; email: string };
type Status = 'loading' | 'signed-in' | 'signed-out';

type AuthValue = {
  status: Status;
  admin: AdminUser | null;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const token = await loadToken();
      if (!token) return active && setStatus('signed-out');
      try {
        const me = await adminApi<{ admin: AdminUser }>('/me');
        if (!active) return;
        setAdmin(me.admin);
        setStatus('signed-in');
      } catch {
        await saveToken(null);
        if (active) setStatus('signed-out');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string, remember: boolean) => {
    const result = await request<{ token: string; admin: AdminUser }>('/api/admin/login', { method: 'POST', body: { email, password, remember } });
    await saveToken(result.token);
    setAdmin(result.admin);
    setStatus('signed-in');
  }, []);

  const signOut = useCallback(async () => {
    try {
      await adminApi('/logout', { method: 'POST' });
    } catch {
      // The token is dropped locally either way.
    }
    await saveToken(null);
    setAdmin(null);
    setStatus('signed-out');
  }, []);

  const value = useMemo(() => ({ status, admin, signIn, signOut }), [status, admin, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

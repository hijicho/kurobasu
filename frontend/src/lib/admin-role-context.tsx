'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import { getMe } from './api';

type Role = 'user' | 'editor' | 'admin';

type AdminRoleContextValue = {
  // role は Firebase ログイン中ユーザーの DB 上の役割。
  // バックエンドの /me が真実の情報源で、フロントからは変更できない。
  role: Role | null;
  loading: boolean;
};

const AdminRoleContext = createContext<AdminRoleContextValue | undefined>(undefined);

export function AdminRoleProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading: authLoading, getIdToken } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadRole() {
      if (authLoading) {
        return;
      }

      if (!isAuthenticated) {
        if (!cancelled) {
          setRole(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const idToken = await getIdToken();
        if (!idToken) {
          throw new Error('no id token');
        }
        const me = await getMe(idToken);
        if (!cancelled) {
          setRole((me.role as Role) || 'user');
        }
      } catch {
        // /me が 404（未 bootstrap）などの場合は権限なし扱いにする
        if (!cancelled) {
          setRole(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRole();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, getIdToken]);

  return <AdminRoleContext.Provider value={{ role, loading }}>{children}</AdminRoleContext.Provider>;
}

export function useAdminRole() {
  const context = useContext(AdminRoleContext);
  if (!context) {
    throw new Error('useAdminRole must be used within AdminRoleProvider');
  }
  return context;
}

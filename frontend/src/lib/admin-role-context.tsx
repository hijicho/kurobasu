'use client';

import { createContext, useContext, useMemo, useState } from 'react';

type Role = 'admin' | 'editor';

type AdminRoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
};

const AdminRoleContext = createContext<AdminRoleContextValue | undefined>(undefined);

export function AdminRoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('admin');

  const value = useMemo(() => ({ role, setRole }), [role]);

  return <AdminRoleContext.Provider value={value}>{children}</AdminRoleContext.Provider>;
}

export function useAdminRole() {
  const context = useContext(AdminRoleContext);
  if (!context) {
    throw new Error('useAdminRole must be used within AdminRoleProvider');
  }
  return context;
}

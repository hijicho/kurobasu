'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'kurobasu_auth';

interface AuthContextValue {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticatedState] = useState(false);

  useEffect(() => {
    setIsAuthenticatedState(window.localStorage.getItem(STORAGE_KEY) === 'true');
  }, []);

  const setIsAuthenticated = (value: boolean) => {
    setIsAuthenticatedState(value);
    window.localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

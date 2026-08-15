'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { bootstrap, logout } from './api';

interface AuthContextValue {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getEmailRedirectTo() {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return `${window.location.origin}/login?confirmed=1`;
}

function clearAuthRedirectHash() {
  if (typeof window === 'undefined' || !window.location.hash.includes('access_token=')) {
    return;
  }

  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const url = new URL(window.location.href);
  url.hash = '';
  if (hashParams.get('type') === 'signup') {
    url.searchParams.set('confirmed', '1');
  }
  window.history.replaceState(null, '', `${url.pathname}${url.search}`);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const bootstrappedSessionIdRef = useRef<string | null>(null);

  const bootstrapSession = async (session: Session) => {
    if (bootstrappedSessionIdRef.current === session.user.id) {
      return;
    }
    bootstrappedSessionIdRef.current = session.user.id;
    await bootstrap(session.access_token, session.user.email || 'User').catch(() => undefined);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session) {
        void bootstrapSession(data.session);
      }
      clearAuthRedirectHash();
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) {
        void bootstrapSession(session);
      }
      clearAuthRedirectHash();
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // ログイン後、DB側のユーザープロファイルが未作成なら作成する（冪等なので毎回叩いてOK）
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
    if (data.session?.access_token) {
      await bootstrap(data.session.access_token, data.user?.email || email);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getEmailRedirectTo(),
      },
    });
    if (error) {
      throw error;
    }
    if (data.session?.access_token) {
      await bootstrap(data.session.access_token, displayName || email);
      return { needsEmailConfirmation: false };
    }
    return { needsEmailConfirmation: true };
  };

  const signOutUser = async () => {
    const idToken = await getIdToken();
    await supabase.auth.signOut();
    if (idToken) {
      await logout(idToken).catch(() => undefined);
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw error;
    }
  };

  const getIdToken = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      return null;
    }
    return data.session.access_token;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        loading,
        user,
        signIn,
        signUp,
        signOutUser,
        resetPassword,
        getIdToken,
      }}
    >
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

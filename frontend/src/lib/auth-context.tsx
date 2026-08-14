'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { bootstrap, logout } from './api';

interface AuthContextValue {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      throw error;
    }
    if (data.session?.access_token) {
      await bootstrap(data.session.access_token, displayName || email);
    }
  };

  const signInAsGuest = async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      throw error;
    }
    if (data.session?.access_token) {
      await bootstrap(data.session.access_token, 'ゲスト');
    }
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
        signInAsGuest,
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

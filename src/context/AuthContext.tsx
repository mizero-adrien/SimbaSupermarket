'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSession, signOut } from 'next-auth/react';
import { User } from '@/types';
import { createUser, getAllUsers, getUserByEmail } from '@/lib/userData';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; user?: User; error?: string }>;
  loginWithGoogle: (profile: { email: string; name?: string }) => Promise<{ ok: boolean; user?: User; error?: string }>;
  signup: (data: SignupData) => Promise<{ ok: boolean; user?: User; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('simba_session');
      if (raw) {
        const session = JSON.parse(raw) as User;
        const allUsers = getAllUsers();
        const fresh = allUsers.find(u => u.id === session.id);
        setUser(fresh ?? null);
      }
    } catch {}
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const allUsers = getAllUsers();
    const found = allUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return { ok: false, error: 'Invalid email or password.' };
    setUser(found);
    localStorage.setItem('simba_session', JSON.stringify(found));
    return { ok: true, user: found };
  }, []);

  const loginWithGoogle = useCallback(async (profile: { email: string; name?: string }) => {
    const cleanEmail = profile.email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return { ok: false, error: 'Please provide a valid Google email.' };
    }

    const existing = getUserByEmail(cleanEmail);
    if (existing) {
      setUser(existing);
      localStorage.setItem('simba_session', JSON.stringify(existing));
      return { ok: true, user: existing };
    }

    const fallbackName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
    const displayName = (profile.name?.trim() || fallbackName || 'Google User')
      .split(' ')
      .filter(Boolean)
      .map(part => part[0]?.toUpperCase() + part.slice(1))
      .join(' ');

    const created = createUser({
      name: displayName,
      email: cleanEmail,
      password: `google-${Date.now()}`,
      role: 'customer',
    });

    if (!created.ok || !created.user) {
      return { ok: false, error: created.error ?? 'Google signup failed.' };
    }

    setUser(created.user);
    localStorage.setItem('simba_session', JSON.stringify(created.user));
    return { ok: true, user: created.user };
  }, []);

  useEffect(() => {
    if (isLoading || user) return;

    let cancelled = false;

    async function syncGoogleSession() {
      const session = await getSession();
      const email = session?.user?.email;
      if (!email || cancelled) return;

      await loginWithGoogle({
        email,
        name: session.user?.name ?? undefined,
      });
    }

    syncGoogleSession();

    return () => {
      cancelled = true;
    };
  }, [isLoading, user, loginWithGoogle]);

  const signup = useCallback(async (data: SignupData) => {
    const result = createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'customer',
      phone: data.phone,
    });
    if (!result.ok || !result.user) {
      return { ok: false, error: result.error ?? 'Signup failed.' };
    }
    const newUser = result.user;
    setUser(newUser);
    localStorage.setItem('simba_session', JSON.stringify(newUser));
    return { ok: true, user: newUser };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('simba_session');
    void signOut({ redirect: false });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { firebaseAuth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import { User } from '@/types';
import { createUser, getAllUsers, getUserByEmail, updateUser } from '@/lib/userData';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; user?: User; error?: string }>;
  loginWithGoogle: () => Promise<{ ok: boolean; user?: User; error?: string }>;
  signup: (data: SignupData) => Promise<{ ok: boolean; user?: User; error?: string }>;
  updateProfile: (patch: { name?: string; phone?: string; email?: string; password?: string }) => { ok: boolean; error?: string };
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

  const syncGoogleProfile = useCallback((profile: { email: string; name?: string }) => {
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
    try {
      const raw = localStorage.getItem('simba_session');
      if (raw) {
        const session = JSON.parse(raw) as User;
        const allUsers = getAllUsers();
        const fresh = allUsers.find(u => u.id === session.id);
        setUser(fresh ?? null);
      }
    } catch {
      // Ignore malformed local sessions.
    }
  }, []);

  useEffect(() => {
    if (!firebaseAuth || !isFirebaseConfigured) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const unsubscribe = onAuthStateChanged(firebaseAuth, async firebaseUser => {
      if (cancelled) return;

      if (firebaseUser?.email) {
        const result = syncGoogleProfile({
          email: firebaseUser.email,
          name: firebaseUser.displayName ?? undefined,
        });

        if (!cancelled && result.ok && result.user) {
          setUser(result.user);
        }
      }

      if (!cancelled) {
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [syncGoogleProfile]);

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

  const loginWithGoogle = useCallback(async () => {
    if (!firebaseAuth || !isFirebaseConfigured) {
      return { ok: false, error: 'Firebase is not configured yet.' };
    }

    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const email = result.user.email;

      if (!email) {
        return { ok: false, error: 'Google sign in did not return an email address.' };
      }

      return syncGoogleProfile({
        email,
        name: result.user.displayName ?? undefined,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign in failed.';
      return { ok: false, error: message };
    }
  }, [syncGoogleProfile]);

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

  const updateProfile = useCallback((patch: { name?: string; phone?: string; email?: string; password?: string }) => {
    if (!user) return { ok: false, error: 'Not logged in.' };
    if (patch.email && patch.email !== user.email) {
      const existing = getUserByEmail(patch.email);
      if (existing && existing.id !== user.id) return { ok: false, error: 'That email is already in use.' };
    }
    const updated = updateUser(user.id, patch);
    if (!updated) return { ok: false, error: 'Update failed.' };
    setUser(updated);
    localStorage.setItem('simba_session', JSON.stringify(updated));
    return { ok: true };
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('simba_session');
    if (firebaseAuth) {
      void signOut(firebaseAuth);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, signup, updateProfile, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

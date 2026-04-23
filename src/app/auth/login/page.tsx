'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, ShoppingCart, X } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (isLoading || !user) return;
    router.replace(user.role === 'customer' ? '/' : '/dashboard');
  }, [user, isLoading, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Email is required.');
      return;
    }
    setLoading(true);
    const result = await login(cleanEmail, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? 'Login failed.');
      return;
    }
    const destination = result.user?.role === 'customer' ? '/' : '/dashboard';
    router.push(destination);
  }

  async function handleGoogleAuth() {
    setError('');
    setGoogleLoading(true);
    const callbackUrl = `${window.location.origin}/`;
    const result = await signIn('google', { callbackUrl });
    setGoogleLoading(false);

    if (result?.error) {
      setError('Google sign in failed. Please try again.');
      return;
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      {/* Close button (home redirect) */}
      <Link href="/" className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full border border-red-200 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300 shadow-lg hover:shadow-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all hover:scale-110">
        <X size={20} />
      </Link>

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-light-border dark:border-dark-border overflow-hidden">
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-[#16a34a] to-[#15803d] px-8 py-6 text-white text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-white font-bold text-2xl mb-2">
              <ShoppingCart size={28} />
              Simba
            </Link>
            <p className="text-sm text-white/80">Welcome back to your account</p>
          </div>

          <div className="p-8">
            {/* Demo credentials hint */}
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
              <p className="font-semibold mb-1">Demo accounts:</p>
              <div className="space-y-0.5 font-mono text-xs">
                <p><span className="font-semibold">Admin:</span> sysadmin@simba.rw / SysAdmin@2024</p>
                <p><span className="font-semibold">Manager:</span> utc@simba.rw / Branch@2024</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                  <span className="text-lg mt-0.5">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 text-sm border border-light-border dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-light-text dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-light-text dark:text-dark-text">
                    Password
                  </label>
                  <Link href="/auth/forgot-password" className="text-xs font-semibold text-[#16a34a] hover:underline">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-10 text-sm border border-light-border dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-light-text dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#15803d] hover:from-[#15803d] hover:to-[#127a3d] disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text font-semibold py-3 rounded-lg hover:border-[#16a34a] hover:bg-[#16a34a]/5 disabled:opacity-60 transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.5 2.7 12 2.7 6.9 2.7 2.7 6.9 2.7 12S6.9 21.3 12 21.3c6.9 0 9.1-4.8 9.1-7.3 0-.5-.1-.9-.1-1.3H12z"/>
                </svg>
                {googleLoading ? 'Connecting Google...' : 'Continue with Google'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-light-border dark:border-dark-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white dark:bg-dark-card text-xs text-gray-500 dark:text-gray-400">New to Simba?</span>
              </div>
            </div>

            <Link href="/auth/signup" className="w-full flex items-center justify-center gap-2 border-2 border-light-border dark:border-dark-border text-light-text dark:text-dark-text font-semibold py-3 rounded-lg hover:border-[#16a34a] hover:text-[#16a34a] transition-all">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

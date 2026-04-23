'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus, ShoppingCart, Check, X } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useAuth } from '@/context/AuthContext';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Contains uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Contains number', ok: /\d/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-[#16a34a]'];

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[score - 1] : 'bg-gray-200 dark:bg-gray-700'}`} />
        ))}
      </div>
      <div className="space-y-1">
        {checks.map(c => (
          <div key={c.label} className={`flex items-center gap-1.5 text-xs ${c.ok ? 'text-[#16a34a]' : 'text-gray-400'}`}>
            <Check size={10} className={c.ok ? 'opacity-100' : 'opacity-0'} />
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const { signup, user, isLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
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
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    if (cleanName.length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (cleanPhone && !/^\+?[0-9\s-]{9,15}$/.test(cleanPhone)) {
      setError('Please enter a valid phone number.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    const result = await signup({
      name: cleanName,
      email: cleanEmail,
      password,
      phone: cleanPhone || undefined,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? 'Signup failed.');
      return;
    }
    const destination = result.user?.role === 'customer' ? '/' : '/dashboard';
    router.push(destination);
  }

  async function handleGoogleSignup() {
    setError('');
    setGoogleLoading(true);
    const callbackUrl = `${window.location.origin}/`;
    const result = await signIn('google', { callbackUrl });
    setGoogleLoading(false);

    if (result?.error) setError('Google signup failed. Please try again.');
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto z-50 py-12">
      {/* Close button (home redirect) */}
      <Link href="/" className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full border border-red-200 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300 shadow-lg hover:shadow-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all hover:scale-110">
        <X size={20} />
      </Link>

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-light-border dark:border-dark-border overflow-hidden">
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-[#f59e0b] to-[#d97706] px-8 py-6 text-white text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-white font-bold text-2xl mb-2">
              <ShoppingCart size={28} />
              Simba
            </Link>
            <p className="text-sm text-white/80">Join us and start shopping</p>
          </div>

          <div className="p-8 max-h-[calc(100vh-200px)] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                  <span className="text-lg mt-0.5">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">Full name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Jean Pierre Uwimana"
                  className="w-full px-4 py-3 text-sm border border-light-border dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-light-text dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 text-sm border border-light-border dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-light-text dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">Phone <span className="font-normal text-gray-400">(optional)</span></label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="+250 7XX XXX XXX"
                  className="w-full px-4 py-3 text-sm border border-light-border dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-light-text dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-10 text-sm border border-light-border dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-light-text dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {password && <PasswordStrength password={password} />}
              </div>

              <div>
                <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">Confirm password</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 text-sm border rounded-lg bg-white dark:bg-dark-bg text-light-text dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                    confirm && confirm !== password
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                      : 'border-light-border dark:border-dark-border focus:border-[#f59e0b] focus:ring-[#f59e0b]/20'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Create Account
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text font-semibold py-3 rounded-lg hover:border-[#f59e0b] hover:bg-[#f59e0b]/5 disabled:opacity-60 transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.5 2.7 12 2.7 6.9 2.7 2.7 6.9 2.7 12S6.9 21.3 12 21.3c6.9 0 9.1-4.8 9.1-7.3 0-.5-.1-.9-.1-1.3H12z"/>
                </svg>
                {googleLoading ? 'Connecting Google...' : 'Sign up with Google'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-light-border dark:border-dark-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white dark:bg-dark-card text-xs text-gray-500 dark:text-gray-400">Already a member?</span>
              </div>
            </div>

            <Link href="/auth/login" className="w-full flex items-center justify-center gap-2 border-2 border-light-border dark:border-dark-border text-light-text dark:text-dark-text font-semibold py-3 rounded-lg hover:border-[#f59e0b] hover:text-[#f59e0b] transition-all">
              Sign In Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

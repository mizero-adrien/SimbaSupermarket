'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, UserPlus, X } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useAuth } from '@/context/AuthContext';

type AuthTab = 'login' | 'signup';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutAuthModal({ onClose, onSuccess }: Props) {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState<AuthTab>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Signup fields
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPass, setShowSignupPass] = useState(false);

  function switchTab(t: AuthTab) {
    setTab(t);
    setError('');
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!loginEmail.trim()) { setError('Email is required.'); return; }
    setLoading(true);
    const result = await login(loginEmail.trim().toLowerCase(), loginPassword);
    setLoading(false);
    if (!result.ok) { setError(result.error ?? 'Login failed.'); return; }
    onSuccess();
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const cleanName = name.trim();
    const cleanEmail = signupEmail.trim().toLowerCase();
    if (cleanName.length < 2) { setError('Please enter your full name.'); return; }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) { setError('Please enter a valid email.'); return; }
    if (signupPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    const result = await signup({ name: cleanName, email: cleanEmail, password: signupPassword, phone: phone.trim() || undefined });
    setLoading(false);
    if (!result.ok) { setError(result.error ?? 'Signup failed.'); return; }
    onSuccess();
  }

  async function handleGoogle() {
    await signIn('google', { callbackUrl: '/checkout' });
  }

  const inputCls = 'w-full px-3 py-2.5 text-sm border border-light-border dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/30 transition-all';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-light-border dark:border-dark-border overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#16a34a] to-[#15803d] px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold text-lg">Sign in to checkout</p>
              <p className="text-sm text-white/80 mt-0.5">Your cart is saved — sign in to continue</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors mt-0.5"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-white/15 rounded-xl p-1">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors ${tab === 'login' ? 'bg-white text-[#16a34a]' : 'text-white/80 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchTab('signup')}
              className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors ${tab === 'signup' ? 'bg-white text-[#16a34a]' : 'text-white/80 hover:text-white'}`}
            >
              Create Account
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5">Email</label>
                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@example.com" className={inputCls} required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-light-text dark:text-dark-text">Password</label>
                  <Link href="/auth/forgot-password" onClick={onClose} className="text-xs text-[#16a34a] hover:underline">Forgot?</Link>
                </div>
                <div className="relative">
                  <input type={showLoginPass ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" className={`${inputCls} pr-10`} required />
                  <button type="button" onClick={() => setShowLoginPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors">
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <LogIn size={16} />}
                {loading ? 'Signing in…' : 'Sign In & Proceed to Checkout'}
              </button>

              <GoogleButton onClick={handleGoogle} />
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jean Pierre Uwimana" className={inputCls} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5">Email</label>
                <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="you@example.com" className={inputCls} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5">
                  Phone <span className="font-normal text-gray-400 text-xs">(optional — used to pre-fill checkout)</span>
                </label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+250 7XX XXX XXX" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5">Password</label>
                <div className="relative">
                  <input type={showSignupPass ? 'text' : 'password'} value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="Min. 8 characters" className={`${inputCls} pr-10`} required />
                  <button type="button" onClick={() => setShowSignupPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showSignupPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors">
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <UserPlus size={16} />}
                {loading ? 'Creating account…' : 'Create Account & Checkout'}
              </button>

              <GoogleButton onClick={handleGoogle} />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text font-semibold py-2.5 rounded-lg hover:border-[#16a34a] hover:bg-[#16a34a]/5 transition-colors text-sm"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.5 2.7 12 2.7 6.9 2.7 2.7 6.9 2.7 12S6.9 21.3 12 21.3c6.9 0 9.1-4.8 9.1-7.3 0-.5-.1-.9-.1-1.3H12z" />
      </svg>
      Continue with Google
    </button>
  );
}

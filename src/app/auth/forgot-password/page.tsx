'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, KeyRound, Mail, RefreshCw, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserByEmail, resetUserPassword } from '@/lib/userData';

type ResetStep = 'request' | 'verify' | 'reset' | 'done';

interface ResetRequest {
  email: string;
  code: string;
  expiresAt: number;
  verified: boolean;
}

const RESET_KEY = 'simba_reset_request';
const RESET_EXPIRY_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_SECONDS = 30;

function createCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function readResetRequest(): ResetRequest | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(RESET_KEY);
    return raw ? JSON.parse(raw) as ResetRequest : null;
  } catch {
    return null;
  }
}

function saveResetRequest(payload: ResetRequest) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RESET_KEY, JSON.stringify(payload));
}

function clearResetRequest() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RESET_KEY);
}

export default function ForgotPasswordPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<ResetStep>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (isLoading || !user) return;
    router.replace(user.role === 'customer' ? '/' : '/dashboard');
  }, [isLoading, user, router]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setInterval(() => {
      setResendIn(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendIn]);

  function dispatchResetCode(targetEmail: string) {
    const generatedCode = createCode();
    saveResetRequest({
      email: targetEmail,
      code: generatedCode,
      expiresAt: Date.now() + RESET_EXPIRY_MS,
      verified: false,
    });
    setResendIn(RESEND_COOLDOWN_SECONDS);
  }

  function handleRequest(e: FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');

    const cleanEmail = email.trim().toLowerCase();
    const found = getUserByEmail(cleanEmail);
    if (!found) {
      setError('No account found with that email.');
      return;
    }

    dispatchResetCode(cleanEmail);
    setStep('verify');
    setInfo('A verification code has been sent. Enter it to continue.');
  }

  function handleResendCode() {
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    const found = getUserByEmail(cleanEmail);
    if (!found) {
      setError('No account found with that email.');
      return;
    }
    dispatchResetCode(cleanEmail);
    setInfo('A new verification code has been sent.');
  }

  function handleVerify(e: FormEvent) {
    e.preventDefault();
    setError('');

    const req = readResetRequest();
    if (!req) {
      setError('Reset session expired. Please request a new code.');
      setStep('request');
      return;
    }

    if (Date.now() > req.expiresAt) {
      clearResetRequest();
      setError('Reset code expired. Please request a new one.');
      setStep('request');
      return;
    }

    if (req.email !== email.trim().toLowerCase()) {
      setError('Email does not match reset request.');
      return;
    }

    if (req.code !== code.trim()) {
      setError('Invalid code.');
      return;
    }

    saveResetRequest({ ...req, verified: true });
    setStep('reset');
    setInfo('Code verified. Set your new password.');
  }

  function handleReset(e: FormEvent) {
    e.preventDefault();
    setError('');

    const req = readResetRequest();
    if (!req || !req.verified || req.email !== email.trim().toLowerCase()) {
      setError('Invalid reset session. Start again.');
      setStep('request');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const result = resetUserPassword(req.email, newPassword);
    if (!result.ok) {
      setError(result.error ?? 'Failed to reset password.');
      return;
    }

    clearResetRequest();
    setStep('done');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-card shadow-xl border border-light-border dark:border-dark-border p-8">
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2 text-[#16a34a] font-bold text-2xl mb-4">
            <ShoppingCart size={28} /> Simba
          </Link>
          <h1 className="text-xl font-bold text-light-text dark:text-dark-text">Forgot Password</h1>
          <p className="text-sm text-gray-500 mt-1">Recover access to your Simba account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-btn border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-300">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 p-3 rounded-btn border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-700 dark:text-blue-300">
            {info}
          </div>
        )}

        {step === 'request' && (
          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
              />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-btn bg-[#16a34a] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#15803d]">
              <Mail size={16} /> Send Reset Code
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="p-3 rounded-btn border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
              Enter the 6-digit verification code sent to <span className="font-semibold">{email}</span>.
            </div>
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">Verification code</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
                placeholder="6-digit code"
                className="w-full px-4 py-2.5 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
              />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-btn bg-[#16a34a] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#15803d]">
              <KeyRound size={16} /> Verify Code
            </button>
            <button
              type="button"
              disabled={resendIn > 0}
              onClick={handleResendCode}
              className="w-full py-2.5 rounded-btn border border-light-border dark:border-dark-border text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <RefreshCw size={14} />
              {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend Code'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('request'); setCode(''); setResendIn(0); }}
              className="w-full py-2.5 rounded-btn text-xs text-gray-500 hover:underline"
            >
              Use a different email
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="w-full px-4 py-2.5 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Repeat new password"
                className="w-full px-4 py-2.5 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
              />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-btn bg-[#16a34a] text-white font-semibold">
              Reset Password
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#16a34a] text-white flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Your password has been reset successfully.</p>
            <Link href="/auth/login" className="inline-flex items-center justify-center w-full py-2.5 rounded-btn bg-[#f59e0b] text-white font-semibold hover:bg-[#d97706]">
              Back to Login
            </Link>
          </div>
        )}

        {step !== 'done' && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Remembered your password?{' '}
            <Link href="/auth/login" className="text-[#16a34a] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

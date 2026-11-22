import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Loader2, Mail, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';
import { login, signup, ApiError, type User } from '../lib/api';
import { Logo } from './Logo';

type Mode = 'login' | 'signup';

export const AuthPage = ({
  mode: initialMode = 'login',
  onSuccess,
  onBack,
}: {
  mode?: Mode;
  onSuccess: (user: User) => void;
  onBack: () => void;
}) => {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === 'signup';

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      setError('Enter a valid email address.');
      return;
    }
    if (isSignup) {
      if (password.length < 8) return setError('Use at least 8 characters.');
      if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        return setError('Include at least one letter and one number.');
      }
    }

    setBusy(true);
    try {
      const res = isSignup ? await signup(trimmed, password, name.trim()) : await login(trimmed, password);
      onSuccess(res.user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^a-zA-Z0-9]/.test(password)) s++;
    return Math.min(s, 4);
  })();

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white text-slate-900 flex flex-col overflow-x-clip"
    >
      <div className="relative flex-1 flex items-center justify-center px-6 py-10">
        {/* soft aurora wash */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[820px] max-w-none h-[480px] bg-gradient-to-r from-lime-500/10 to-cyan-500/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          <button
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} /> Back to site
          </button>

          <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-xl">
            <div className="flex items-center gap-3">
              <Logo size={28} />
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {isSignup
                ? 'One account keeps every blueprint you generate.'
                : 'Sign in to generate a new blueprint or review an old one.'}
            </p>

            {/* tabs */}
            <div className="mt-6 grid grid-cols-2 gap-1 p-1 rounded-full bg-slate-100 border border-slate-200">
              {(['login', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`py-2 rounded-full text-sm font-semibold transition-all ${
                    mode === m ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m === 'login' ? 'Log in' : 'Sign up'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              {isSignup && (
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Name (optional)</span>
                  <div className="mt-2 relative">
                    <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      placeholder="Alex"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-lime-600 focus:ring-2 focus:ring-lime-600/15 outline-none transition-all"
                    />
                  </div>
                </label>
              )}

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Email</span>
                <div className="mt-2 relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-lime-600 focus:ring-2 focus:ring-lime-600/15 outline-none transition-all"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Password</span>
                <div className="mt-2 relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    required
                    placeholder={isSignup ? 'At least 8 characters' : '••••••••'}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-11 py-3 text-slate-900 placeholder:text-slate-400 focus:border-lime-600 focus:ring-2 focus:ring-lime-600/15 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {isSignup && password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          strength <= 1 ? 'bg-red-400' : strength === 2 ? 'bg-amber-400' : strength === 3 ? 'bg-lime-500' : 'bg-lime-600'
                        }`}
                        style={{ width: `${(strength / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                      {['', 'weak', 'ok', 'good', 'strong'][strength]}
                    </span>
                  </div>
                )}
              </label>

              {error && (
                <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3.5 rounded-full bg-[#B6FF3C] text-black font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_8px_24px_rgba(101,163,13,0.35)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {busy ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> {isSignup ? 'Creating account…' : 'Signing in…'}
                  </>
                ) : (
                  <>
                    {isSignup ? 'Create account' : 'Log in'} <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-slate-500">
              {isSignup ? 'Already have an account? ' : 'New to TrainWise? '}
              <button
                type="button"
                onClick={() => switchMode(isSignup ? 'login' : 'signup')}
                className="font-semibold text-lime-700 hover:underline"
              >
                {isSignup ? 'Log in' : 'Create one free'}
              </button>
            </p>
          </div>

          <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-500">
            Passwords are hashed with scrypt and sessions are httpOnly cookies.
            <br />
            We never store a plan against an unauthenticated visitor.
          </p>
        </div>
      </div>
    </motion.main>
  );
};

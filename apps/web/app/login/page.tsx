'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, Sparkles, AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@enlightsales.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [authMode, setAuthMode] = useState<'password' | 'magic-link'>('password');

  // Redirect if already authenticated
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session || localStorage.getItem('token')) {
        router.replace('/');
      }
    }
    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (authMode === 'magic-link') {
        const { error: magicErr } = await supabase.auth.signInWithOtp({ email });
        if (magicErr) throw magicErr;
        setSuccessMsg('Magic Login Link sent to your email! Check your inbox.');
        setLoading(false);
        return;
      }

      // Try Supabase Auth First
      const { data: supaData, error: supaErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!supaErr && supaData.session) {
        localStorage.setItem('token', supaData.session.access_token);
        localStorage.setItem('user', JSON.stringify({
          email: supaData.user?.email,
          id: supaData.user?.id,
          provider: 'supabase'
        }));
        setSuccessMsg('Supabase Authentication successful! Redirecting...');
        setTimeout(() => router.push('/'), 600);
        return;
      }

      // Fallback to Backend Local Auth (for local demo / dev environment)
      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(supaErr?.message || data.detail || 'Invalid email or password');
      }

      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccessMsg('Authentication successful! Redirecting...');
      setTimeout(() => router.push('/'), 600);
    } catch (err: any) {
      setError(err.message || 'Unable to complete Supabase Authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Ambient Decorative Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-[128px] pointer-events-none" />

      {/* Main Glassmorphic Login Card */}
      <div className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-slate-950/80 space-y-6 z-10">

        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Powered by Supabase Auth
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sign In
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            Enlight Sales OS — Automated Invoice Dashboard
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-950/90 p-1 rounded-2xl border border-slate-800 text-xs font-medium text-slate-400">
          <button
            type="button"
            onClick={() => setAuthMode('password')}
            className={`flex-1 py-2 rounded-xl transition-all ${authMode === 'password' ? 'bg-blue-600 text-white shadow-lg' : 'hover:text-slate-200'}`}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('magic-link')}
            className={`flex-1 py-2 rounded-xl transition-all ${authMode === 'magic-link' ? 'bg-blue-600 text-white shadow-lg' : 'hover:text-slate-200'}`}
          >
            Magic Link
          </button>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-300 p-3.5 rounded-2xl text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-red-200">Supabase Auth Error: </span>
              {error}
            </div>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3.5 rounded-2xl text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Form Controls */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="admin@enlightsales.com"
              />
            </div>
          </div>

          {/* Password Field (Only when Password mode selected) */}
          {authMode === 'password' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-10 pr-10 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-200 shadow-xl shadow-blue-600/25 hover:shadow-blue-500/35 hover:-translate-y-0.5 text-sm disabled:opacity-50"
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating via Supabase...</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'magic-link' ? 'Send Magic Link' : 'Sign In with Supabase'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </button>
        </form>

        {/* Footer Security Badges */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase JWT Secured</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Statutory Rate Lock</span>
          </div>
        </div>

      </div>
    </div>
  );
}

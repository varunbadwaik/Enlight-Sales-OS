'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, Lock, Mail, ArrowRight, CheckCircle2, Sparkles, 
  AlertCircle, Eye, EyeOff, User, BadgeCheck, Briefcase, 
  KeyRound, UserPlus, LogIn, ChevronRight 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  
  // Auth Modes: 'signin' | 'signup' | 'magic-link'
  const [authTab, setAuthTab] = useState<'signin' | 'signup' | 'magic-link'>('signin');
  
  // Form State
  const [email, setEmail] = useState('admin@enlightsales.com');
  const [password, setPassword] = useState('admin123');
  const [fullName, setFullName] = useState('System Admin');
  const [role, setRole] = useState<'Admin' | 'Accountant' | 'Sales_Manager'>('Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  // Demo Login Quick Preset Handler
  const handleQuickPreset = (presetRole: 'Admin' | 'Accountant' | 'Sales_Manager') => {
    setAuthTab('signin');
    setRole(presetRole);
    if (presetRole === 'Admin') {
      setEmail('admin@enlightsales.com');
      setPassword('admin123');
      setFullName('System Admin');
    } else if (presetRole === 'Accountant') {
      setEmail('accountant@enlightsales.com');
      setPassword('accountant123');
      setFullName('Senior Accountant');
    } else {
      setEmail('sales@enlightsales.com');
      setPassword('sales123');
      setFullName('Sales Manager');
    }
  };

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      // 1. MAGIC LINK AUTHENTICATION
      if (authTab === 'magic-link') {
        const { error: magicErr } = await supabase.auth.signInWithOtp({ 
          email,
          options: {
            data: { full_name: fullName, role: role }
          }
        });
        if (magicErr) throw magicErr;
        setSuccessMsg(`Magic Sign-in Link dispatched to ${email}! Check your inbox.`);
        setLoading(false);
        return;
      }

      // 2. SIGN UP / USER REGISTRATION
      if (authTab === 'signup') {
        const { data: supaSignUpData, error: supaSignUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
            }
          }
        });

        if (supaSignUpErr) throw supaSignUpErr;

        if (supaSignUpData.user) {
          // Store registered user metadata locally
          const userObj = {
            id: supaSignUpData.user.id,
            email: supaSignUpData.user.email || email,
            full_name: fullName,
            role: role,
            provider: 'supabase'
          };
          
          if (supaSignUpData.session) {
            localStorage.setItem('token', supaSignUpData.session.access_token);
            localStorage.setItem('user', JSON.stringify(userObj));
            setSuccessMsg('Account created & authenticated! Redirecting to Dashboard...');
            setTimeout(() => router.push('/'), 600);
          } else {
            setSuccessMsg('Account created successfully! Please check your email to verify your address.');
          }
        }
        return;
      }

      // 3. SIGN IN / EXISTING USER AUTHENTICATION
      const { data: supaData, error: supaErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!supaErr && supaData.session && supaData.user) {
        const userMeta = supaData.user.user_metadata || {};
        const resolvedRole = userMeta.role || role || 'Admin';
        const resolvedName = userMeta.full_name || fullName || email.split('@')[0];

        localStorage.setItem('token', supaData.session.access_token);
        localStorage.setItem('user', JSON.stringify({
          id: supaData.user.id,
          email: supaData.user.email,
          full_name: resolvedName,
          role: resolvedRole,
          provider: 'supabase'
        }));
        setSuccessMsg(`Authenticated as ${resolvedName} (${resolvedRole})! Redirecting...`);
        setTimeout(() => router.push('/'), 600);
        return;
      }

      // Fallback to Local API Authentication (For offline local dev environments)
      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const localData = await res.json().catch(() => ({}));
        throw new Error(supaErr?.message || localData.detail || 'Invalid authentication credentials');
      }

      const data = await res.json();
      const userPayload = {
        id: data.user?.id || 'user-id',
        email: data.user?.email || email,
        full_name: data.user?.full_name || fullName,
        role: data.user?.role || role || 'Admin',
        provider: 'local'
      };

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(userPayload));

      setSuccessMsg(`Authenticated as ${userPayload.full_name} (${userPayload.role})! Redirecting...`);
      setTimeout(() => router.push('/'), 600);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Ambient Radial Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Glassmorphic Container */}
      <div className="relative w-full max-w-lg bg-slate-900/85 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-slate-950/80 space-y-6 z-10">

        {/* Header & App Branding */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Supabase Auth & Role-Based Authorization
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <span>⚡ Enlight Sales OS</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Automated Weighbridge Intake, Rate Lock & Zoho Draft Invoices
          </p>
        </div>

        {/* Auth Mode Tabs (Sign In / Sign Up / Magic Link) */}
        <div className="flex bg-slate-950/90 p-1 rounded-2xl border border-slate-800 text-xs font-medium text-slate-400">
          <button
            type="button"
            onClick={() => { setAuthTab('signin'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              authTab === 'signin' ? 'bg-blue-600 text-white shadow-lg font-bold' : 'hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthTab('signup'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              authTab === 'signup' ? 'bg-emerald-600 text-white shadow-lg font-bold' : 'hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthTab('magic-link'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              authTab === 'magic-link' ? 'bg-purple-600 text-white shadow-lg font-bold' : 'hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Magic Link</span>
          </button>
        </div>

        {/* Demo Roles Quick-Selector (For instant testing) */}
        <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between px-1">
            <span>Quick Test Credentials:</span>
            <span className="text-[10px] text-blue-400 font-semibold">Click to Auto-fill</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickPreset('Admin')}
              className={`p-2 rounded-xl border text-left transition-all ${
                role === 'Admin' && authTab === 'signin'
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-200 font-bold' 
                  : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-blue-400 text-[11px]">👑 Admin</div>
              <div className="text-[10px] opacity-75 truncate">Full System Access</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset('Accountant')}
              className={`p-2 rounded-xl border text-left transition-all ${
                role === 'Accountant' && authTab === 'signin'
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-200 font-bold' 
                  : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-purple-400 text-[11px]">💼 Accountant</div>
              <div className="text-[10px] opacity-75 truncate">Zoho Draft & Audit</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset('Sales_Manager')}
              className={`p-2 rounded-xl border text-left transition-all ${
                role === 'Sales_Manager' && authTab === 'signin'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-bold' 
                  : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-emerald-400 text-[11px]">🚚 Sales Mgr</div>
              <div className="text-[10px] opacity-75 truncate">Dispatches Intake</div>
            </button>
          </div>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-300 p-3.5 rounded-2xl text-xs leading-relaxed animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-red-200">Authentication Alert: </span>
              {error}
            </div>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3.5 rounded-2xl text-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleAuthentication} className="space-y-4">
          
          {/* Full Name Field (Sign Up Mode Only) */}
          {authTab === 'signup' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder="e.g. Varun Badwaik"
                />
              </div>
            </div>
          )}

          {/* Email Address Field */}
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

          {/* Password Field (Not required for Magic Link) */}
          {authTab !== 'magic-link' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                {authTab === 'signin' && (
                  <span className="text-[11px] text-blue-400 hover:underline cursor-pointer" onClick={() => setAuthTab('magic-link')}>
                    Forgot password?
                  </span>
                )}
              </div>
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

          {/* Role Authorization Selection */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Assign Authorization Role</span>
              <span className="text-[10px] text-slate-500">RBAC Controls</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                role === 'Admin'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="Admin"
                  checked={role === 'Admin'}
                  onChange={() => setRole('Admin')}
                  className="sr-only"
                />
                <span>👑 Admin</span>
              </label>

              <label className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                role === 'Accountant'
                  ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="Accountant"
                  checked={role === 'Accountant'}
                  onChange={() => setRole('Accountant')}
                  className="sr-only"
                />
                <span>💼 Accountant</span>
              </label>

              <label className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                role === 'Sales_Manager'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="Sales_Manager"
                  checked={role === 'Sales_Manager'}
                  onChange={() => setRole('Sales_Manager')}
                  className="sr-only"
                />
                <span>🚚 Sales Mgr</span>
              </label>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full relative group overflow-hidden text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-200 shadow-xl text-sm disabled:opacity-50 mt-2 ${
              authTab === 'signup' 
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 shadow-emerald-600/25'
                : authTab === 'magic-link'
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-purple-600/25'
                : 'bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 shadow-blue-600/25'
            }`}
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>
                    {authTab === 'signup' 
                      ? `Create Account (${role})` 
                      : authTab === 'magic-link' 
                      ? 'Dispatch Magic Link' 
                      : `Sign In as ${role}`}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </button>
        </form>

        {/* Security & Authorization Footnote */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase JWT RBAC</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>₹58.00/kg Rate Enforcement</span>
          </div>
        </div>

      </div>
    </div>
  );
}

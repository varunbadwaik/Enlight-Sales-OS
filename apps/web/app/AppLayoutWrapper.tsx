'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogOut, Search, ChevronRight, FileText, CheckSquare, AlertTriangle, MessageSquare, Activity, Plus } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface UserInfo {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';
  const [user, setUser] = useState<UserInfo | null>({
    id: 'default-user',
    email: 'admin@enlightsales.com',
    full_name: 'Varun Badwaik',
    role: 'Admin'
  });
  const [authChecked, setAuthChecked] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

        let session = null;
        if (isSupabaseConfigured) {
          try {
            const { data } = await supabase.auth.getSession();
            session = data?.session || null;
          } catch (err) {
            console.warn('Supabase getSession warning:', err);
          }
        }

        if (userData) {
          try {
            const parsed = JSON.parse(userData);
            if (parsed && typeof parsed === 'object') {
              setUser(parsed);
              return;
            }
          } catch (e) {
            // ignore
          }
        }

        if (session) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Varun Badwaik',
            role: 'Admin'
          });
          return;
        }

        if (token) {
          setUser({
            id: 'user-token-id',
            email: 'admin@enlightsales.com',
            full_name: 'Varun Badwaik',
            role: 'Admin'
          });
          return;
        }
      } catch (err) {
        console.error('checkAuthStatus error:', err);
      } finally {
        setAuthChecked(true);
      }
    }

    checkAuthStatus();
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signout warning:', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.replace('/login');
  };

  // Login page — render with no sidebar layout
  if (isLoginPage) {
    return <div className="min-h-screen bg-[#F4F4F6] text-slate-900">{children}</div>;
  }

  // Still checking auth — show clean loading state
  if (!authChecked || !user) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#F4F4F6', color: '#64748B',
        fontFamily: 'Inter, sans-serif', fontSize: '14px', gap: '12px'
      }}>
        <span style={{
          width: '22px', height: '22px', border: '2px solid rgba(100,116,139,0.3)',
          borderTopColor: '#0F172A', borderRadius: '50%',
          display: 'inline-block', animation: 'spin 0.8s linear infinite'
        }} />
        Loading Enlight Sales OS...
      </div>
    );
  }

  const getBreadcrumbTitle = () => {
    if (pathname === '/') return 'Dashboard Overview';
    if (pathname?.startsWith('/dispatches')) return 'Dispatches & Logistics';
    if (pathname === '/approvals') return 'Approvals Queue';
    if (pathname === '/invoices') return 'Zoho Draft Invoices';
    if (pathname === '/exceptions') return 'Discrepancies';
    if (pathname === '/whatsapp') return 'WhatsApp Agent Intake';
    return 'Sales OS';
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation matching Pulse Clinic Reference */}
      <aside className="sidebar flex flex-col justify-between">
        <div>
          {/* Brand Logo & Tagline */}
          <div className="pb-3 border-b border-slate-200/80 mb-2">
            <div className="brand-logo">
              <div className="brand-icon">⚡</div>
              <span>Enlight Sales OS</span>
              <span className="brand-badge">OS 1.0</span>
            </div>
          </div>

          {/* Grouped Nav Section 1: OVERVIEW */}
          <div className="nav-section-title">Overview</div>
          <nav className="nav-menu">
            <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
              <Activity className="w-4 h-4 text-slate-600" />
              <span>Today</span>
            </Link>
          </nav>

          {/* Grouped Nav Section 2: DISPATCHES & PIPELINE */}
          <div className="nav-section-title">Dispatches & Pipeline</div>
          <nav className="nav-menu">
            <Link href="/dispatches" className={`nav-item ${pathname?.startsWith('/dispatches') ? 'active' : ''}`}>
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Dispatches</span>
            </Link>
            <Link href="/approvals" className={`nav-item ${pathname === '/approvals' ? 'active' : ''}`}>
              <CheckSquare className="w-4 h-4 text-slate-600" />
              <span>Approvals Queue</span>
            </Link>
            <Link href="/invoices" className={`nav-item ${pathname === '/invoices' ? 'active' : ''}`}>
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Zoho Draft Invoices</span>
            </Link>
          </nav>

          {/* Grouped Nav Section 3: EXCEPTIONS & AI */}
          <div className="nav-section-title">Exceptions & AI</div>
          <nav className="nav-menu">
            <Link href="/exceptions" className={`nav-item ${pathname === '/exceptions' ? 'active' : ''}`}>
              <AlertTriangle className="w-4 h-4 text-slate-600" />
              <span>Discrepancies</span>
            </Link>
            <Link href="/whatsapp" className={`nav-item ${pathname === '/whatsapp' ? 'active' : ''}`}>
              <MessageSquare className="w-4 h-4 text-slate-600" />
              <span>WhatsApp Agent</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
            </Link>
          </nav>
        </div>

        {/* User Profile Pill at Bottom Left */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center text-xs shrink-0">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'V'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-900 truncate">
                {user?.full_name || 'Varun Badwaik'}
              </div>
              <div className="text-[10px] text-slate-500 font-semibold truncate">
                {user?.role || 'Admin'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="text-slate-400 hover:text-red-600 p-1 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Wrapper: Top Header + Main Content */}
      <div className="main-wrapper">
        {/* Top Header Bar matching Reference UI */}
        <header className="top-header-bar">
          {/* Left Breadcrumbs */}
          <div className="flex items-center gap-2 font-medium text-xs">
            <span className="font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>⚡</span> ENLIGHT SALES OS
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600 font-semibold">{getBreadcrumbTitle()}</span>
          </div>

          {/* Right Global Controls */}
          <div className="flex items-center gap-4">
            {/* Search Input Bar */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Go to..."
                className="bg-slate-100 border border-slate-200/90 rounded-lg pl-8 pr-12 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all w-48"
              />
              <span className="absolute right-2 text-[10px] font-bold bg-white text-slate-500 border border-slate-200 rounded px-1 py-0.5">
                ⌘K
              </span>
            </div>

            {/* Quick Action Button */}
            <button
              onClick={() => router.push('/dispatches')}
              className="btn-dark-pill"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Dispatch</span>
            </button>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

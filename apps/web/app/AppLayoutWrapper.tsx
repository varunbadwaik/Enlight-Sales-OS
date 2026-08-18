'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogOut, ShieldCheck, Lock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface UserInfo {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

// Role-Based Access Control (RBAC) Route Definitions
const ROLE_PERMISSIONS: Record<string, string[]> = {
  Admin: ['/', '/dispatches', '/approvals', '/invoices', '/exceptions', '/whatsapp'],
  Accountant: ['/', '/dispatches', '/approvals', '/invoices', '/exceptions'],
  Sales_Manager: ['/', '/dispatches', '/whatsapp'],
};

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function checkAuthStatus() {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      const { data: { session } } = await supabase.auth.getSession();

      if (!session && (!token || !userData)) {
        if (!isLoginPage) {
          router.replace('/login');
        }
        setAuthChecked(true);
        return;
      }

      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {
          setUser({
            id: session?.user?.id || 'user-1',
            email: session?.user?.email || 'admin@enlightsales.com',
            full_name: session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'User',
            role: session?.user?.user_metadata?.role || 'Admin'
          });
        }
      } else if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          role: session.user.user_metadata?.role || 'Admin'
        });
      }
      setAuthChecked(true);
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

  // Login page — render with no sidebar
  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>;
  }

  // Still checking auth — show minimal loading state
  if (!authChecked || !user) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#090D16', color: '#94A3B8',
        fontFamily: 'Inter, sans-serif', fontSize: '14px', gap: '12px'
      }}>
        <span style={{
          width: '22px', height: '22px', border: '2px solid rgba(148,163,184,0.3)',
          borderTopColor: '#3B82F6', borderRadius: '50%',
          display: 'inline-block', animation: 'spin 0.8s linear infinite'
        }} />
        Authenticating & Verifying Role Permissions...
      </div>
    );
  }

  // Authorization Check for current path
  const userRole = user.role || 'Admin';
  const allowedRoutes = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.Admin;
  const isAuthorized = allowedRoutes.some(route => 
    route === '/' ? pathname === '/' : pathname.startsWith(route)
  );

  const roleBadgeColor = userRole === 'Admin' ? '#3B82F6' : userRole === 'Accountant' ? '#8B5CF6' : '#10B981';

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar flex flex-col justify-between">
        <div>
          {/* Brand Logo & Tagline */}
          <div>
            <div className="brand-logo">
              <div className="brand-icon">⚡</div>
              <span>Enlight Metals</span>
              <span className="brand-badge">V1.0</span>
            </div>
            <p className="brand-tagline">Zoho Draft Invoice OS</p>
          </div>

          {/* Navigation Menu (Filtered dynamically by Role Authorization) */}
          <nav className="nav-menu mt-4">
            {allowedRoutes.includes('/') && (
              <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
                <span style={{ fontSize: '18px' }}>📊</span> Dashboard
              </Link>
            )}

            {allowedRoutes.includes('/dispatches') && (
              <Link href="/dispatches" className={`nav-item ${pathname?.startsWith('/dispatches') ? 'active' : ''}`}>
                <span style={{ fontSize: '18px' }}>🚚</span> Dispatches
              </Link>
            )}

            {allowedRoutes.includes('/approvals') && (
              <Link href="/approvals" className={`nav-item ${pathname === '/approvals' ? 'active' : ''}`}>
                <span style={{ fontSize: '18px' }}>⏳</span> Approvals Queue
              </Link>
            )}

            {allowedRoutes.includes('/invoices') && (
              <Link href="/invoices" className={`nav-item ${pathname === '/invoices' ? 'active' : ''}`}>
                <span style={{ fontSize: '18px' }}>📑</span> Zoho Draft Invoices
              </Link>
            )}

            {allowedRoutes.includes('/exceptions') && (
              <Link href="/exceptions" className={`nav-item ${pathname === '/exceptions' ? 'active' : ''}`}>
                <span style={{ fontSize: '18px' }}>⚠️</span> Discrepancies
              </Link>
            )}

            {allowedRoutes.includes('/whatsapp') && (
              <Link href="/whatsapp" className={`nav-item ${pathname === '/whatsapp' ? 'active' : ''}`}>
                <span style={{ fontSize: '18px' }}>💬</span> WhatsApp Agent
                <span style={{
                  marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981'
                }} />
              </Link>
            )}
          </nav>
        </div>

        {/* User Profile & High-Visibility Logout Section */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* Profile Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: roleBadgeColor, color: '#FFF', fontWeight: '800',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                boxShadow: '0 0 12px rgba(59, 130, 246, 0.3)'
              }}>
                {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#F8FAFC', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user.full_name}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck style={{ width: '12px', height: '12px', color: '#10B981' }} />
                  {userRole}
                </div>
              </div>
            </div>

            {/* High Visibility Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#FCA5A5',
                padding: '9px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.color = '#FCA5A5';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
              }}
            >
              <LogOut style={{ width: '14px', height: '14px' }} />
              <span>Log Out</span>
            </button>
          </div>

          {/* Statutory Protection Banner */}
          <div className="statutory-card" style={{ marginTop: '14px' }}>
            <div className="statutory-title">
              <span>🛡️</span> Statutory Rule
            </div>
            Draft invoices locked at Customer PO rate (₹58.00/kg). Status = DRAFT only.
          </div>
        </div>
      </aside>

      {/* Main Content Viewport or 403 Forbidden Screen */}
      <main className="main-content">
        {isAuthorized ? (
          children
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
            <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-10 max-w-md w-full space-y-6 shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/40">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-white">403 — Unauthorized Access</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your current role <span className="font-bold text-red-400">[{userRole}]</span> does not have authorization to view <span className="font-mono text-slate-200">{pathname}</span>.
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-1.5 text-slate-300">
                <div className="font-semibold text-slate-400">Allowed Routes for {userRole}:</div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {allowedRoutes.map(r => (
                    <span key={r} className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[11px]">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Authorized Dashboard</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs transition-all"
                >
                  Switch User Role (Sign Out)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

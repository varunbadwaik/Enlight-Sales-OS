'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogOut, ShieldCheck, User } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

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
            role: 'Admin'
          });
        }
      } else if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          role: 'Admin'
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
        Connecting to Enlight Sales OS...
      </div>
    );
  }

  const roleBadgeColor = user.role === 'Admin' ? '#3B82F6' : user.role === 'Accountant' ? '#8B5CF6' : '#10B981';

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

          {/* Navigation Menu */}
          <nav className="nav-menu mt-4">
            <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
              <span style={{ fontSize: '18px' }}>📊</span> Dashboard
            </Link>
            <Link href="/dispatches" className={`nav-item ${pathname?.startsWith('/dispatches') ? 'active' : ''}`}>
              <span style={{ fontSize: '18px' }}>🚚</span> Dispatches
            </Link>
            <Link href="/approvals" className={`nav-item ${pathname === '/approvals' ? 'active' : ''}`}>
              <span style={{ fontSize: '18px' }}>⏳</span> Approvals Queue
            </Link>
            <Link href="/invoices" className={`nav-item ${pathname === '/invoices' ? 'active' : ''}`}>
              <span style={{ fontSize: '18px' }}>📑</span> Zoho Draft Invoices
            </Link>
            <Link href="/exceptions" className={`nav-item ${pathname === '/exceptions' ? 'active' : ''}`}>
              <span style={{ fontSize: '18px' }}>⚠️</span> Discrepancies
            </Link>
            <Link href="/whatsapp" className={`nav-item ${pathname === '/whatsapp' ? 'active' : ''}`}>
              <span style={{ fontSize: '18px' }}>💬</span> WhatsApp Agent
              <span style={{
                marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981'
              }} />
            </Link>
          </nav>
        </div>

        {/* User Profile & Prominent Logout Section */}
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
                  {user.role}
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

      {/* Main Content Viewport */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

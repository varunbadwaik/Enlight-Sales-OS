'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      if (!isLoginPage) {
        router.replace('/login');
      }
      setAuthChecked(true);
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!isLoginPage) {
        router.replace('/login');
      }
    }
    setAuthChecked(true);
  }, [isLoginPage, router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
      <aside className="sidebar">
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
        <nav className="nav-menu">
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

        {/* User Profile Card */}
        <div style={{
          marginTop: '24px', background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px',
          padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              backgroundColor: roleBadgeColor, color: '#FFF', fontWeight: '800',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
            }}>
              {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#F8FAFC' }}>
                {user.full_name}
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>
                {user.role}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{
              background: 'transparent', border: 'none', color: '#64748B',
              cursor: 'pointer', fontSize: '16px', padding: '4px',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#EF4444')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#64748B')}
          >
            🚪
          </button>
        </div>

        {/* Statutory Protection Banner */}
        <div className="statutory-card" style={{ marginTop: '16px' }}>
          <div className="statutory-title">
            <span>🛡️</span> Statutory Rule
          </div>
          Draft invoices locked at Customer PO rate (₹58.00/kg). Status = DRAFT only.
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

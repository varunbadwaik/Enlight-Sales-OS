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

  // Rate Lock State
  const [fixRate, setFixRate] = useState<string>('58.00');
  const [isEditingRate, setIsEditingRate] = useState<boolean>(false);
  const [tempRate, setTempRate] = useState<string>('58.00');

  // Load and listen to Rate Lock changes globally
  useEffect(() => {
    const savedRate = typeof window !== 'undefined' ? (localStorage.getItem('fix_rate') || '58.00') : '58.00';
    setFixRate(savedRate);
    setTempRate(savedRate);

    const handleRateUpdate = (e: any) => {
      const newRate = e.detail || localStorage.getItem('fix_rate') || '58.00';
      setFixRate(newRate);
      setTempRate(newRate);
    };

    window.addEventListener('fixRateChanged', handleRateUpdate);
    window.addEventListener('storage', handleRateUpdate);
    return () => {
      window.removeEventListener('fixRateChanged', handleRateUpdate);
      window.removeEventListener('storage', handleRateUpdate);
    };
  }, []);

  // Auth check
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

  const handleSaveRate = async () => {
    const num = parseFloat(tempRate);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid positive rate.');
      return;
    }
    const formatted = num.toFixed(2);
    setFixRate(formatted);
    localStorage.setItem('fix_rate', formatted);
    setIsEditingRate(false);

    // Sync with FastAPI backend rate store
    try {
      await fetch('http://localhost:8000/api/v1/config/rate-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: num })
      });
    } catch (e) {
      console.warn('Backend rate lock sync notice:', e);
    }

    // Dispatch custom event to notify open page views and sidebar components
    window.dispatchEvent(new CustomEvent('fixRateChanged', { detail: formatted }));
  };

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
        minHeight: '100vh', background: '#F4F5F7', color: '#64748B',
        fontFamily: 'Inter, sans-serif', fontSize: '13px', gap: '10px'
      }}>
        <span style={{
          width: '18px', height: '18px', border: '2px solid #CBD5E1',
          borderTopColor: '#0F172A', borderRadius: '50%',
          display: 'inline-block', animation: 'spin 0.8s linear infinite'
        }} />
        Connecting to Enlight Sales OS...
      </div>
    );
  }

  // Compute breadcrumb path
  const getBreadcrumbs = () => {
    if (pathname === '/') return { section: 'OVERVIEW', page: 'Today' };
    if (pathname?.startsWith('/dispatches')) return { section: 'CONSULTING ROOM', page: 'Dispatches' };
    if (pathname === '/approvals') return { section: 'CARE', page: 'Approvals Queue' };
    if (pathname === '/invoices') return { section: 'CARE', page: 'Prescriptions / Zoho Invoices' };
    if (pathname === '/exceptions') return { section: 'CONSULTING ROOM', page: 'Lab Requests / Discrepancies' };
    if (pathname === '/whatsapp') return { section: 'CONSULTING ROOM', page: 'WhatsApp AI Agent' };
    return { section: 'CONSULTING ROOM', page: 'Dashboard' };
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        {/* Brand Header */}
        <div className="brand-header">
          <div className="brand-logo-icon">⚡</div>
          <div>
            <div className="brand-title">Enlight Metals</div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="nav-section-label">OVERVIEW</div>
        <nav className="nav-menu">
          <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
            <span>📊</span> Today
          </Link>
        </nav>

        {/* Care & Processing Section */}
        <div className="nav-section-label">CARE</div>
        <nav className="nav-menu">
          <Link href="/approvals" className={`nav-item ${pathname === '/approvals' ? 'active' : ''}`}>
            <span>⏳</span> Approvals Queue
          </Link>
          <Link href="/invoices" className={`nav-item ${pathname === '/invoices' ? 'active' : ''}`}>
            <span>📑</span> Prescriptions & Invoices
          </Link>
        </nav>

        {/* Consulting Room / Sales Ops Section */}
        <div className="nav-section-label">CONSULTING ROOM</div>
        <nav className="nav-menu">
          <Link href="/dispatches" className={`nav-item ${pathname?.startsWith('/dispatches') ? 'active' : ''}`}>
            <span>🚚</span> My Schedule & Dispatches
          </Link>
          <Link href="/exceptions" className={`nav-item ${pathname === '/exceptions' ? 'active' : ''}`}>
            <span>🔬</span> Lab Requests & Exceptions
          </Link>
          <Link href="/whatsapp" className={`nav-item ${pathname === '/whatsapp' ? 'active' : ''}`}>
            <span>💬</span> WhatsApp AI Intake
            <span style={{
              marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%',
              backgroundColor: '#10B981', boxShadow: '0 0 6px #10B981'
            }} />
          </Link>
        </nav>

        {/* Settings & Configuration Section */}
        <div className="nav-section-label">CONFIGURATION</div>
        <nav className="nav-menu">
          <button
            type="button"
            onClick={() => setIsEditingRate(true)}
            className="nav-item"
            style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <span>⚙️</span> PO Rate Lock: <strong>₹{fixRate}/kg</strong>
          </button>
        </nav>

        {/* Statutory Alert Banner */}
        <div className="statutory-alert-banner">
          {isEditingRate ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontWeight: '700', fontSize: '11px', color: '#9F1239', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>✏️ Set Fixed PO Selling Rate</span>
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#9F1239', display: 'block', marginBottom: '3px', fontWeight: '600' }}>
                  Rate (₹ / kg):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tempRate}
                  onChange={(e) => setTempRate(e.target.value)}
                  style={{
                    width: '100%', padding: '6px 8px', fontSize: '12px', borderRadius: '6px',
                    border: '1px solid #FDA4AF', outline: 'none', fontWeight: '700',
                    boxSizing: 'border-box', backgroundColor: '#FFFFFF', color: '#0F172A'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                <button
                  onClick={handleSaveRate}
                  style={{
                    flex: 1, backgroundColor: '#0F172A', color: '#FFFFFF', border: 'none',
                    borderRadius: '6px', padding: '6px 0', fontSize: '11px', fontWeight: '700',
                    cursor: 'pointer', textAlign: 'center'
                  }}
                >
                  Save Rate
                </button>
                <button
                  onClick={() => setIsEditingRate(false)}
                  style={{
                    backgroundColor: '#FFFFFF', color: '#475569', border: '1px solid #CBD5E1',
                    borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>⚠️</span> Statutory Rule: Rate Lock
                </div>
                <button
                  onClick={() => setIsEditingRate(true)}
                  style={{
                    background: '#9F1239', color: '#FFFFFF', border: 'none', borderRadius: '4px',
                    padding: '2px 6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
              </div>
              <div>
                Locked at Customer PO rate <strong style={{ color: '#0F172A', textDecoration: 'underline' }}>₹{fixRate}/kg</strong>. Status = DRAFT only.
              </div>
            </div>
          )}
        </div>

        {/* Sidebar User Card */}
        <div className="sidebar-user-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              backgroundColor: '#0F172A', color: '#FFFFFF', fontWeight: '700',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px'
            }}>
              {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>
                {user.full_name}
              </div>
              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '500' }}>
                {user.role}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{
              background: 'transparent', border: 'none', color: '#94A3B8',
              cursor: 'pointer', fontSize: '14px', padding: '2px',
              transition: 'color 0.15s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#EF4444')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#94A3B8')}
          >
            🚪
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="main-viewport">
        {/* Top Header Bar */}
        <header className="top-nav-bar">
          <div className="breadcrumb-trail">
            <span>{breadcrumbs.section}</span>
            <span style={{ color: '#CBD5E1' }}>❯</span>
            <span style={{ color: '#0F172A' }}>{breadcrumbs.page}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="top-search-box">
              <span>🔍</span>
              <input type="text" placeholder="Go to..." readOnly />
              <span className="top-search-badge">⌘K</span>
            </div>
            <span style={{ fontSize: '14px', color: '#64748B', cursor: 'pointer' }}>🔔</span>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="content-body">
          {children}
        </main>
      </div>
    </div>
  );
}

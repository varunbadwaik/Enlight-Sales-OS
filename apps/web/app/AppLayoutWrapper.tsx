'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogOut, ShieldCheck, User, Edit3, Check, X, DollarSign } from 'lucide-react';
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

  // Dynamic Customer PO Rate State
  const [poRate, setPoRate] = useState<string>('58.00');
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState<string>('58.00');

  useEffect(() => {
    // Load stored PO Rate or default to 58.00
    if (typeof window !== 'undefined') {
      const storedRate = localStorage.getItem('customer_po_rate') || '58.00';
      setPoRate(storedRate);
      setTempRate(storedRate);
    }

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

  const handleSaveRate = () => {
    const formatted = parseFloat(tempRate || '58.00').toFixed(2);
    setPoRate(formatted);
    localStorage.setItem('customer_po_rate', formatted);
    setIsEditingRate(false);

    // Dispatch global event for all open pages
    window.dispatchEvent(new CustomEvent('poRateUpdated', { detail: formatted }));
  };

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

          {/* Dynamic Statutory Protection Card with Rate Editor */}
          <div className="statutory-card" style={{ marginTop: '14px' }}>
            <div className="statutory-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🛡️</span> Statutory Rule
              </div>
              {!isEditingRate && (
                <button
                  onClick={() => setIsEditingRate(true)}
                  style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#60A5FA',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)')}
                >
                  <Edit3 style={{ width: '10px', height: '10px' }} />
                  <span>Edit Rate</span>
                </button>
              )}
            </div>

            {isEditingRate ? (
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Set Customer PO Rate (₹/kg):</div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '12px', fontWeight: '700' }}>₹</span>
                    <input
                      type="number"
                      step="0.01"
                      value={tempRate}
                      onChange={(e) => setTempRate(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#0F172A',
                        border: '1px solid #3B82F6',
                        borderRadius: '6px',
                        padding: '5px 8px 5px 22px',
                        color: '#F8FAFC',
                        fontSize: '13px',
                        fontWeight: '700',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <button
                    onClick={handleSaveRate}
                    title="Save Rate"
                    style={{
                      background: '#10B981', border: 'none', color: '#FFF',
                      borderRadius: '6px', padding: '6px', cursor: 'pointer'
                    }}
                  >
                    <Check style={{ width: '14px', height: '14px' }} />
                  </button>
                  <button
                    onClick={() => { setIsEditingRate(false); setTempRate(poRate); }}
                    title="Cancel"
                    style={{
                      background: '#64748B', border: 'none', color: '#FFF',
                      borderRadius: '6px', padding: '6px', cursor: 'pointer'
                    }}
                  >
                    <X style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '4px', fontSize: '12px', lineHeight: '1.5', color: '#94A3B8' }}>
                Draft invoices locked at Customer PO rate (<span style={{ color: '#38BDF8', fontWeight: '700' }}>₹{poRate}/kg</span>). Status = DRAFT only.
              </div>
            )}
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

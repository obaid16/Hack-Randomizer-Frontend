'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Sparkles,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Wifi,
  WifiOff,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NAV_ITEMS } from '@/lib/constants';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const { admin, logout, backendOnline } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If on login page, render without sidebar shell
  if (pathname === '/login') {
    return <>{children}</>;
  }

  const iconMap = {
    LayoutDashboard: <LayoutDashboard size={19} />,
    Users: <Users size={19} />,
    UserCheck: <UserCheck size={19} />,
    Sparkles: <Sparkles size={19} />,
    History: <History size={19} />,
    Settings: <Settings size={19} />
  };

  return (
    <div className="app-layout">
      {/* Background Ambience */}
      <div className="bg-ambient" />

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 35 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`app-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-badge">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="brand-title">HackTeam</h1>
            <span className="brand-subtitle">Randomizer Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                {iconMap[item.icon]}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-card">
            <div className="admin-info">
              <div className="admin-avatar">
                {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <p className="admin-name">{admin?.name || 'Admin User'}</p>
                <p className="admin-role">{admin?.role || 'Administrator'}</p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={logout}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main App Content */}
      <div className="app-main">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ display: 'none' }}
              aria-label="Toggle Navigation"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Internal College Hackathon Portal
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {backendOnline ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#15803d',
                  background: '#dcfce7',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  border: '1px solid #bbf7d0'
                }}
              >
                <Wifi size={14} />
                <span>Backend Connected</span>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#b91c1c',
                  background: '#fee2e2',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  border: '1px solid #fecaca'
                }}
              >
                <WifiOff size={14} />
                <span>Backend Offline</span>
              </div>
            )}
          </div>
        </header>

        <main className="content-container">
          {!backendOnline && (
            <div className="connection-banner">
              <div className="connection-banner-text">
                <ShieldAlert size={20} />
                <div>
                  <strong>Atlas / Backend Connection Disconnected:</strong> Live API requests will fail until MongoDB Atlas is configured in Backend/.env and the backend is running.
                </div>
              </div>
              <Link href="/settings" className="btn btn-secondary btn-sm">
                View Config
              </Link>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

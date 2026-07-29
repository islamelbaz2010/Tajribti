import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/overview', label: 'Live Overview' },
  { to: '/campaign', label: 'Campaign & QR' },
  { to: '/insights', label: 'Demographics' },
  { to: '/survey', label: 'Survey Results' },
  { to: '/summary', label: 'AI Summary' },
  { to: '/participants', label: 'Participants' },
  { to: '/report', label: 'Download Report' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.root}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoText}>Tajribti</span>
          <span style={styles.logoBadge}>Demo</span>
        </div>
        <nav style={styles.nav}>
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Sign Out
        </button>
      </aside>
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    height: '100vh',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: '#f5f6fa',
  },
  sidebar: {
    width: 220,
    background: '#1a1a2e',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    flexShrink: 0,
  },
  logo: {
    padding: '0 20px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 700,
    display: 'block',
    color: '#fff',
  },
  logoBadge: {
    fontSize: 11,
    background: '#e94560',
    color: '#fff',
    borderRadius: 4,
    padding: '2px 6px',
    marginTop: 4,
    display: 'inline-block',
    fontWeight: 600,
    letterSpacing: 0.5,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: 2,
    padding: '0 12px',
  },
  navItem: {
    color: 'rgba(255,255,255,0.65)',
    textDecoration: 'none',
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  navItemActive: {
    background: 'rgba(233,69,96,0.2)',
    color: '#e94560',
  },
  main: {
    flex: 1,
    overflow: 'auto',
    padding: 32,
  },
  logoutBtn: {
    margin: '16px 20px 0',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.6)',
    borderRadius: 8,
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 13,
  },
};

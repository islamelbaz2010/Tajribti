import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

// Founder ruling W-2 (2026-09-02): the TAJRIBTI Admin Control Center's own
// shell — visually related to the Company Console's Layout.tsx (same
// palette/typography) but a genuinely separate component/route tree, per
// "Do NOT collapse Company and Admin into one interface." Navigation:
// Companies (-> Company -> Employees/Campaigns) and Campaigns (global,
// cross-Company) — the "Admin -> Company -> Campaigns -> Selected
// Campaign -> Participants/Data -> Insights -> Report" hierarchy this
// ruling requires.
const NAV_ITEMS = [
  { to: '/admin/companies', label: 'Companies' },
  { to: '/admin/campaigns', label: 'Campaigns' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div style={styles.root}>
      <aside style={styles.sidebar}>
        <div style={styles.logoArea}>
          <div style={styles.logoRow}>
            <span style={styles.logoText}>TAJRIBTI</span>
          </div>
          <div style={styles.consoleLabel}>Admin Control Center</div>
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
    background: '#f7f8fb',
  },
  sidebar: {
    width: 220,
    background: '#0a1120',
    borderRight: '1px solid #182238',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflowY: 'auto',
  },
  logoArea: {
    padding: '24px 20px 18px',
    borderBottom: '1px solid #182238',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 900,
    color: '#ffffff',
    letterSpacing: 3,
  },
  consoleLabel: {
    fontSize: 10,
    color: '#b2f24d',
    fontWeight: 700,
    letterSpacing: 1,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '16px 12px',
  },
  navItem: {
    display: 'block',
    color: '#a8b3c9',
    textDecoration: 'none',
    padding: '10px 12px',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    transition: 'all 0.15s',
    borderLeft: '2px solid transparent',
    marginBottom: 2,
  },
  navItemActive: {
    background: 'rgba(178, 242, 77, 0.1)',
    color: '#b2f24d',
    borderLeft: '2px solid #b2f24d',
  },
  main: {
    flex: 1,
    overflow: 'auto',
    padding: 32,
    background: '#f7f8fb',
  },
  logoutBtn: {
    margin: '12px 20px 24px',
    background: 'transparent',
    border: '1px solid #253048',
    color: '#a8b3c9',
    borderRadius: 6,
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
    textAlign: 'left' as const,
  },
};

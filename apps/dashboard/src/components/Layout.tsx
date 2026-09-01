import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { campaignApi } from '../api/endpoints';

const NAV_SECTIONS = [
  {
    group: 'CAMPAIGN',
    items: [
      { to: '/campaigns', label: 'Campaign Management' },
      { to: '/overview', label: 'Overview' },
      { to: '/campaign', label: 'Trial QR' },
    ],
  },
  {
    group: 'CONSUMERS',
    items: [
      { to: '/insights', label: 'Who Tried It?' },
      { to: '/survey', label: 'What Did They Say?' },
      { to: '/participants', label: 'Participants' },
    ],
  },
  {
    group: 'CAMPAIGN OPS',
    items: [
      { to: '/gallery', label: 'Media / Gallery' },
    ],
  },
  {
    group: 'INTELLIGENCE',
    items: [
      { to: '/summary', label: 'What Did We Learn?' },
    ],
  },
  {
    group: 'REPORT',
    items: [
      { to: '/report', label: 'Campaign Report' },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [clientName, setClientName] = useState<string>('');
  const [isDemo, setIsDemo] = useState<boolean>(true);

  // Selected campaign's own id (if ?campaignId= is present) — carried onto
  // every nav link below so switching between Overview/Trial QR/Insights/etc.
  // keeps showing the same campaign instead of silently reverting to the
  // brand's default active one.
  const selectedCampaignId = new URLSearchParams(location.search).get('campaignId');
  const navSuffix = selectedCampaignId ? `?campaignId=${selectedCampaignId}` : '';

  useEffect(() => {
    if (!isAuthenticated) return;
    campaignApi.getSelected()
      .then((c) => {
        if (c) {
          setClientName(c.brandName);
          setIsDemo(c.isDemo);
        }
      })
      .catch(() => {});
  }, [isAuthenticated, location.search]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.root}>
      <aside style={styles.sidebar}>
        <div style={styles.logoArea}>
          <div style={styles.logoRow}>
            <span style={styles.logoText}>TAJRIBTI</span>
            {isDemo && <span style={styles.demoBadge}>DEMO</span>}
          </div>
          {clientName && (
            <div style={styles.clientName}>{clientName}</div>
          )}
          <div style={styles.liveRow}>
            <div style={styles.liveDot} />
            <span style={styles.liveLabel}>Consumer Intelligence · Active</span>
          </div>
        </div>

        <nav style={styles.nav}>
          <NavLink
            to="/campaigns/new"
            style={({ isActive }) => ({
              ...styles.newCampaignBtn,
              ...(isActive ? styles.newCampaignBtnActive : {}),
            })}
          >
            + New Campaign
          </NavLink>

          {NAV_SECTIONS.map(({ group, items }) => (
            <div key={group} style={styles.navSection}>
              <div style={styles.navGroupLabel}>{group}</div>
              {items.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={`${to}${navSuffix}`}
                  style={({ isActive }) => ({
                    ...styles.navItem,
                    ...(isActive ? styles.navItemActive : {}),
                  })}
                >
                  {label}
                </NavLink>
              ))}
            </div>
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
    background: '#070c1a',
  },
  sidebar: {
    width: 232,
    background: '#040812',
    borderRight: '1px solid #111d35',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflowY: 'auto',
  },
  logoArea: {
    padding: '24px 20px 18px',
    borderBottom: '1px solid #111d35',
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
    color: '#edf0ff',
    letterSpacing: 3,
  },
  demoBadge: {
    fontSize: 9,
    fontWeight: 800,
    color: '#040812',
    background: '#b2f24d',
    borderRadius: 3,
    padding: '2px 7px',
    letterSpacing: 1.5,
  },
  clientName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#b2f24d',
    marginBottom: 8,
    lineHeight: 1.3,
  },
  liveRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#b2f24d',
    animation: 'pulse 1.8s infinite',
    flexShrink: 0,
  },
  liveLabel: {
    fontSize: 10,
    color: '#2e3d5e',
    fontWeight: 500,
    letterSpacing: 0.3,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '8px 12px',
  },
  navSection: {
    marginTop: 16,
  },
  navGroupLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: '#2e3d5e',
    letterSpacing: 1.5,
    padding: '0 8px',
    marginBottom: 4,
  },
  navItem: {
    display: 'block',
    color: '#4a5a7e',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    transition: 'all 0.15s',
    borderLeft: '2px solid transparent',
    marginBottom: 1,
  },
  navItemActive: {
    background: 'rgba(178, 242, 77, 0.07)',
    color: '#b2f24d',
    borderLeft: '2px solid #b2f24d',
  },
  newCampaignBtn: {
    display: 'block',
    textAlign: 'center' as const,
    background: 'rgba(178, 242, 77, 0.08)',
    border: '1px solid rgba(178, 242, 77, 0.25)',
    color: '#b2f24d',
    textDecoration: 'none',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0.3,
    margin: '4px 8px 8px',
  },
  newCampaignBtnActive: {
    background: '#b2f24d',
    color: '#040812',
  },
  main: {
    flex: 1,
    overflow: 'auto',
    padding: 32,
    background: '#070c1a',
  },
  logoutBtn: {
    margin: '12px 20px 24px',
    background: 'transparent',
    border: '1px solid #111d35',
    color: '#2e3d5e',
    borderRadius: 6,
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
    textAlign: 'left' as const,
  },
};

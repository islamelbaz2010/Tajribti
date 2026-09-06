import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { campaignApi } from '../api/endpoints';
import type { Campaign } from '../api/types';

const STATUS_LABEL_COLOR: Record<string, string> = {
  active: '#b2f24d',
  draft: '#6b7fa8',
  paused: '#f5c451',
  completed: '#5b8cff',
  archived: '#4a5a7e',
};

// Company Console IA (Product Transformation, 2026-09-01 → DL-112 2026-09-06):
// Campaign Workspace — Overview is the natural landing for any selected campaign:
// it immediately answers WHAT IS THIS / STATUS / JOURNEY / SIGNALS / INTENT.
// Configure (formerly "Details & QR") is the setup/edit screen — reached after
// understanding what the campaign is doing, not before. All routes unchanged;
// only grouping, order, and labels changed.
// Consumer Data group: "Demographics" → "Insights" (page now covers the full
// insight model: WHO → THINK → INTEND → SEGMENTS). "CONSUMER INSIGHTS" →
// "CONSUMER DATA" (data-forward framing consistent with platform positioning).
const NAV_SECTIONS = [
  {
    group: 'CAMPAIGN',
    items: [
      { to: '/campaigns', label: 'All Campaigns' },
      { to: '/overview', label: 'Overview' },
      { to: '/campaign', label: 'Configure' },
      { to: '/gallery', label: 'Media' },
    ],
  },
  {
    group: 'CONSUMER DATA',
    items: [
      { to: '/participants', label: 'Participants' },
      { to: '/insights', label: 'Insights' },
      { to: '/survey', label: 'Survey Results' },
      { to: '/summary', label: 'AI Insights' },
      { to: '/report', label: 'Report' },
    ],
  },
];

// Company Foundation (2026-09-01): a third, company-scoped group — not
// campaign-scoped, so it deliberately does not carry ?campaignId=.
// Founder ruling W-1 (2026-09-02): Employees added to the same group —
// same reasoning (Company-scoped, not Campaign-scoped).
const COMPANY_NAV_ITEMS = [
  { to: '/company', label: 'Company Profile' },
  { to: '/employees', label: 'Employees' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [clientName, setClientName] = useState<string>('');
  const [isDemo, setIsDemo] = useState<boolean>(true);
  // Campaign-as-organizing-entity (Product Transformation, 2026-09-01):
  // the sidebar always shows which campaign the Company is currently
  // working in — product name + status — so switching between Campaign
  // and Consumer Insights pages still feels like one continuous workspace,
  // not five unrelated screens. Reuses the existing getSelected() call
  // Layout already made; just keeps the full campaign instead of two
  // fields off it.
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);

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
          setActiveCampaign(c);
        }
      })
      .catch(() => setActiveCampaign(null));
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
          </div>
          <div style={styles.consoleLabel}>Company Console</div>
          {clientName && <div style={styles.clientName}>{clientName}</div>}
        </div>

        {/* Campaign-as-organizing-entity: which campaign every page below is
            currently scoped to, so Campaign and Consumer Insights pages read
            as one workspace, not disconnected screens. */}
        {activeCampaign && (
          <div style={styles.campaignContext}>
            <div style={styles.campaignContextLabel}>Working on</div>
            <div style={styles.campaignContextProduct}>{activeCampaign.productName}</div>
            <div style={styles.campaignContextMeta}>
              <span
                style={{
                  ...styles.statusPill,
                  color: STATUS_LABEL_COLOR[activeCampaign.status] ?? '#6b7fa8',
                  borderColor: `${STATUS_LABEL_COLOR[activeCampaign.status] ?? '#6b7fa8'}55`,
                }}
              >
                {activeCampaign.status.toUpperCase()}
              </span>
              {isDemo && <span style={styles.demoBadge}>DEMO</span>}
            </div>
          </div>
        )}

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

          <div style={styles.navSection}>
            <div style={styles.navGroupLabel}>COMPANY</div>
            {COMPANY_NAV_ITEMS.map(({ to, label }) => (
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
          </div>
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
    width: 232,
    background: '#ffffff',
    borderRight: '1px solid #e8ecf3',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflowY: 'auto',
  },
  logoArea: {
    padding: '24px 20px 18px',
    borderBottom: '1px solid #e8ecf3',
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
    color: '#0a1120',
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
  consoleLabel: {
    fontSize: 10,
    color: '#7a8bab',
    fontWeight: 600,
    letterSpacing: 1,
    marginBottom: 8,
  },
  clientName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#b2f24d',
    lineHeight: 1.3,
  },
  campaignContext: {
    padding: '14px 20px',
    borderBottom: '1px solid #e8ecf3',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  campaignContextLabel: {
    fontSize: 9,
    color: '#7a8bab',
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  campaignContextProduct: {
    fontSize: 13,
    color: '#0a1120',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  campaignContextMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusPill: {
    fontSize: 9,
    fontWeight: 800,
    border: '1px solid',
    borderRadius: 3,
    padding: '2px 7px',
    letterSpacing: 1,
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
    color: '#7a8bab',
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
    background: '#f7f8fb',
  },
  logoutBtn: {
    margin: '12px 20px 24px',
    background: 'transparent',
    border: '1px solid #e8ecf3',
    color: '#7a8bab',
    borderRadius: 6,
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
    textAlign: 'left' as const,
  },
};

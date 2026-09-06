import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { campaignApi } from '../api/endpoints';
import type { Campaign } from '../api/types';

// Campaign Management entry point (2026-09-01): the single place a brand
// lands to see every campaign on its account and reach Create/Edit/QR/Media
// for any of them. Previously the only campaign list in the product was the
// "Other Campaigns" strip at the bottom of Overview (informational-only,
// no manage affordance) — this page is additive, reuses the existing
// GET /campaigns/my + status model, and does not replace Overview/Trial QR.
const STATUS_COLORS: Record<string, string> = {
  active: '#b2f24d',
  draft: '#6b7fa8',
  paused: '#f5c451',
  completed: '#5b8cff',
  archived: '#4a5a7e',
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? '#6b7fa8';
  return (
    <span style={{ ...styles.statusBadge, color, borderColor: `${color}55`, background: `${color}14` }}>
      {status.toUpperCase()}
    </span>
  );
}

// Reference Product Benchmark, Operational Control (2026-09-02): mirrors the
// same client-side "needs attention" hint added to the Admin campaign list
// — a campaign still marked `active` whose endDate has passed is already
// closed to new participation server-side (isCampaignOpenForParticipation(),
// campaign.entity.ts); this just surfaces that to the Company too, from
// data the card already has. No backend change.
function needsAttention(c: { status: string; endDate: string | null }): boolean {
  if (c.status !== 'active' || !c.endDate) return false;
  const today = new Date().toISOString().slice(0, 10);
  return c.endDate < today;
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [error, setError] = useState('');
  const location = useLocation();
  // Preserve the currently-active campaign context when the user navigates to
  // the campaign list (e.g., from the "All Campaigns" nav link while working
  // in a campaign workspace). The selected campaignId is passed via ?campaignId=
  // so we can visually indicate which campaign they were last working on.
  const activeCampaignId = new URLSearchParams(location.search).get('campaignId');

  useEffect(() => {
    campaignApi
      .getMyCampaigns()
      .then(setCampaigns)
      .catch(() => setError('Could not load campaigns. Is the backend running?'));
  }, []);

  return (
    <div>
      <div style={styles.header}>
        <div>
          {/* DL-107 (2026-09-06): visual harmonization — editorial badge aligns
              Campaign Management header with the premium editorial pattern used
              on Insights, SurveyResults, and Participants. */}
          <span style={styles.demoBadge}>CAMPAIGN MANAGEMENT</span>
          <h1 style={styles.title}>My Campaigns</h1>
          <p style={styles.sub}>Every campaign on this account — create, edit, and manage from here.</p>
        </div>
        <Link to="/campaigns/new" style={styles.newBtn}>
          + New Campaign
        </Link>
      </div>

      {error && <div style={styles.errMsg}>{error}</div>}

      {!error && campaigns === null && <div style={styles.muted}>Loading campaigns…</div>}

      {campaigns !== null && campaigns.length === 0 && (
        <div style={styles.emptyState}>
          <h2 style={styles.emptyTitle}>No campaigns yet</h2>
          <p style={styles.emptySub}>
            This account has no campaigns yet. Create the first one to start collecting trial
            signals.
          </p>
          <Link to="/campaigns/new" style={styles.newBtn}>
            + New Campaign
          </Link>
        </div>
      )}

      {campaigns !== null && campaigns.length > 0 && (
        <div style={styles.grid}>
          {campaigns.map((c) => (
            <div
              key={c.id}
              style={{
                ...styles.card,
                // Highlight the campaign that was last selected so the user
                // can find it immediately when returning to the list.
                ...(activeCampaignId === c.id ? styles.cardActive : {}),
              }}
            >
              <div style={styles.cardImageWrap}>
                {c.productImage ? (
                  <img src={c.productImage} alt={c.productName} style={styles.cardImage} />
                ) : (
                  <div style={styles.cardImagePlaceholder}>No product image</div>
                )}
                <div style={styles.cardBadgeRow}>
                  {activeCampaignId === c.id && (
                    <span style={styles.activeCampaignBadge}>● WORKING ON</span>
                  )}
                  {c.isDemo && <span style={styles.demoBadge}>DEMO</span>}
                  <StatusBadge status={c.status} />
                  {needsAttention(c) && (
                    <span style={styles.attentionBadge} title="This campaign's end date has passed — consumers can no longer join. Consider marking it Completed.">
                      NEEDS ATTENTION
                    </span>
                  )}
                </div>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.cardBrand}>{c.brandName}</div>
                <div style={styles.cardProduct}>{c.productName}</div>
                <div style={styles.cardMeta}>
                  {c.participantCount ?? 0} / {c.targetCount} participants · {c.rewardPoints} pts
                  {c.locationName ? ` · ${c.locationName}` : ''}
                </div>
                {c.targetCount > 0 && (
                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${Math.min(100, Math.round(((c.participantCount ?? 0) / c.targetCount) * 100))}%`,
                      }}
                    />
                  </div>
                )}
                {/* DL-112 (2026-09-06): primary action is now "View Campaign" →
                    campaign Overview (signals, journey, purchase intent, live feed).
                    "Configure" is the secondary action for the setup/edit page.
                    Benchmark: the first thing a brand does when working on a
                    campaign is understand it, not edit it. */}
                <div style={styles.cardActions}>
                  <Link to={`/overview?campaignId=${c.id}`} style={styles.actionBtnPrimary}>
                    View Campaign
                  </Link>
                  <Link to={`/campaign?campaignId=${c.id}`} style={styles.actionBtn}>
                    Configure
                  </Link>
                  <Link to={`/gallery?campaignId=${c.id}`} style={styles.actionBtn}>
                    Media
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: 800, color: '#0a1120', margin: '0 0 6px', letterSpacing: -0.3 },
  sub: { fontSize: 13, color: '#4a5a7e', margin: 0 },
  newBtn: {
    background: '#b2f24d',
    color: '#040812',
    textDecoration: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 0.3,
    flexShrink: 0,
  },
  muted: { color: '#7a8bab', fontSize: 14, marginTop: 32 },
  errMsg: {
    color: '#dc2626',
    fontSize: 13,
    background: 'rgba(251, 113, 133, 0.08)',
    border: '1px solid rgba(251, 113, 133, 0.2)',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: 20,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center' as const,
    background: '#ffffff',
    border: '1px solid #e8ecf3',
    borderRadius: 16,
    padding: '64px 32px',
    marginTop: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: 800, color: '#0a1120', margin: '0 0 8px' },
  emptySub: { fontSize: 13, color: '#4a5a7e', margin: '0 0 24px', maxWidth: 420, lineHeight: 1.5 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 18,
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e8ecf3',
    borderRadius: 16,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  cardActive: {
    border: '2px solid #b2f24d',
    boxShadow: '0 0 0 3px rgba(178,242,77,0.12)',
  },
  cardImageWrap: {
    position: 'relative' as const,
    height: 140,
    background: '#f7f8fb',
  },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover' as const, display: 'block' },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#7a8bab',
    fontSize: 11,
    fontWeight: 600,
  },
  cardBadgeRow: {
    position: 'absolute' as const,
    top: 10,
    left: 10,
    right: 10,
    display: 'flex',
    gap: 6,
    justifyContent: 'space-between',
  },
  // DL-107: editorial badge — used for both the page header label and card DEMO badges
  activeCampaignBadge: {
    display: 'inline-block',
    fontSize: 9,
    fontWeight: 800,
    color: '#166534',
    background: 'rgba(178,242,77,0.18)',
    border: '1px solid rgba(178,242,77,0.5)',
    borderRadius: 3,
    padding: '3px 8px',
    letterSpacing: 1,
    marginBottom: 4,
  },
  demoBadge: {
    display: 'inline-block',
    fontSize: 9,
    fontWeight: 800,
    color: '#040812',
    background: '#b2f24d',
    borderRadius: 3,
    padding: '3px 8px',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  statusBadge: {
    fontSize: 9,
    fontWeight: 800,
    borderRadius: 3,
    padding: '3px 8px',
    letterSpacing: 1,
    border: '1px solid',
    marginLeft: 'auto',
  },
  attentionBadge: {
    fontSize: 9,
    fontWeight: 800,
    color: '#b91c1c',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 3,
    padding: '3px 8px',
    letterSpacing: 1,
  },
  cardBody: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  cardBrand: { fontSize: 15, fontWeight: 800, color: '#0a1120' },
  cardProduct: { fontSize: 12, color: '#4a5a7e', fontWeight: 500 },
  cardMeta: { fontSize: 11, color: '#7a8bab', marginTop: 4, marginBottom: 6 },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    background: '#eef1f7',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    background: '#b2f24d',
    borderRadius: 2,
  },
  cardActions: { display: 'flex', gap: 8, flexWrap: 'wrap' as const },
  actionBtnPrimary: {
    background: 'rgba(178, 242, 77, 0.1)',
    border: '1px solid rgba(178, 242, 77, 0.3)',
    color: '#b2f24d',
    textDecoration: 'none',
    borderRadius: 6,
    padding: '6px 12px',
    fontSize: 11,
    fontWeight: 700,
  },
  actionBtn: {
    background: 'transparent',
    border: '1px solid #dde3ee',
    color: '#4a5a7e',
    textDecoration: 'none',
    borderRadius: 6,
    padding: '6px 12px',
    fontSize: 11,
    fontWeight: 600,
  },
};

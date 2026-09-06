import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminStatsApi } from '../../api/adminEndpoints';

type Stats = {
  totalCompanies: number;
  campaignsByStatus: Record<string, number>;
  needsAttention: Array<{ id: string; productName: string; companyName: string | null; endDate: string; participantCount: number }>;
  recentCampaigns: Array<{ id: string; productName: string; companyName: string | null; status: string; createdAt: string }>;
};

const STATUS_COLOR: Record<string, string> = {
  active: '#16a34a',
  draft: '#6b7fa8',
  paused: '#d97706',
  completed: '#2563eb',
  archived: '#4a5a7e',
};

// Admin Operations Overview (Reference Blueprint: "DASHBOARD / OPERATIONS
// OVERVIEW" — the first level of the hierarchy Admin → Companies → Campaign
// Pipeline → Company → Campaign → …).  Answers the operator's first
// question: "What is happening across TAJRIBTI right now, and what needs
// my attention?"
export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminStatsApi
      .getStats()
      .then(setStats)
      .catch(() => setError('Could not load operational stats. Refresh to retry.'))
      .finally(() => setLoading(false));
  }, []);

  const totalCampaigns = stats
    ? Object.values(stats.campaignsByStatus).reduce((s, n) => s + n, 0)
    : 0;
  const activeCampaigns = stats?.campaignsByStatus['active'] ?? 0;
  const attentionCount = stats?.needsAttention.length ?? 0;

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <span style={styles.adminBadge}>TAJRIBTI ADMIN</span>
          <h1 style={styles.title}>Operations Overview</h1>
          <p style={styles.sub}>
            Real-time operational state across all Companies and Campaigns.
          </p>
        </div>
      </div>

      {error && <div style={styles.errMsg}>{error}</div>}

      {loading && <div style={styles.muted}>Loading operational state…</div>}

      {stats && (
        <>
          {/* ── Stat cards ─────────────────────────────────────────── */}
          <div style={styles.statGrid}>
            <StatCard
              label="Companies"
              value={stats.totalCompanies}
              sub="registered on TAJRIBTI"
              link="/admin/companies"
              linkLabel="View all →"
              accent="#b2f24d"
            />
            <StatCard
              label="Total Campaigns"
              value={totalCampaigns}
              sub="across all Companies"
              link="/admin/campaigns"
              linkLabel="Campaign pipeline →"
              accent="#5b8cff"
            />
            <StatCard
              label="Active Now"
              value={activeCampaigns}
              sub="open to consumers"
              link="/admin/campaigns?status=active"
              linkLabel="View active →"
              accent="#16a34a"
            />
            <StatCard
              label="Needs Attention"
              value={attentionCount}
              sub="expired but still active"
              link="/admin/campaigns?status=active"
              linkLabel="Review →"
              accent={attentionCount > 0 ? '#dc2626' : '#6b7fa8'}
            />
          </div>

          {/* ── Status breakdown ───────────────────────────────────── */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Campaign Pipeline by Status</div>
            <div style={styles.statusGrid}>
              {(['active', 'draft', 'paused', 'completed', 'archived'] as const).map((s) => (
                <Link
                  key={s}
                  to={`/admin/campaigns?status=${s}`}
                  style={styles.statusCard}
                >
                  <div
                    style={{
                      ...styles.statusDot,
                      background: STATUS_COLOR[s] ?? '#6b7fa8',
                    }}
                  />
                  <div style={styles.statusCount}>
                    {stats.campaignsByStatus[s] ?? 0}
                  </div>
                  <div style={styles.statusLabel}>{s.toUpperCase()}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Operational Issues ─────────────────────────────────── */}
          {attentionCount > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                <span style={styles.alertDot} /> Operational Issues — Campaigns Needing Attention
              </div>
              <p style={styles.sectionSub}>
                These campaigns are still marked <strong>ACTIVE</strong> but their end dates have
                passed — consumers can no longer join. Mark them Completed to close them out.
              </p>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Campaign</th>
                      <th style={styles.th}>Company</th>
                      <th style={styles.th}>Ended</th>
                      <th style={styles.th}>Participants</th>
                      <th style={styles.th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.needsAttention.map((c) => (
                      <tr key={c.id}>
                        <td style={styles.td}>{c.productName}</td>
                        <td style={{ ...styles.td, color: '#7a8bab' }}>{c.companyName ?? '—'}</td>
                        <td style={{ ...styles.td, color: '#dc2626', fontWeight: 700 }}>{c.endDate}</td>
                        <td style={styles.td}>{c.participantCount}</td>
                        <td style={styles.td}>
                          <Link to={`/admin/campaigns/${c.id}`} style={styles.actionLink}>
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Recent Activity ────────────────────────────────────── */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Recent Campaigns</div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Campaign</th>
                    <th style={styles.th}>Company</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Created</th>
                    <th style={styles.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentCampaigns.map((c) => (
                    <tr key={c.id}>
                      <td style={styles.td}>{c.productName}</td>
                      <td style={{ ...styles.td, color: '#7a8bab' }}>{c.companyName ?? '—'}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusPill,
                            color: STATUS_COLOR[c.status] ?? '#6b7fa8',
                            borderColor: `${STATUS_COLOR[c.status] ?? '#6b7fa8'}44`,
                            background: `${STATUS_COLOR[c.status] ?? '#6b7fa8'}14`,
                          }}
                        >
                          {c.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ ...styles.td, color: '#7a8bab' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td style={styles.td}>
                        <Link to={`/admin/campaigns/${c.id}`} style={styles.actionLink}>
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link to="/admin/campaigns" style={styles.viewAllLink}>
              View full campaign pipeline →
            </Link>
          </div>

          {/* ── Quick Navigation ───────────────────────────────────── */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Quick Navigation</div>
            <div style={styles.quickGrid}>
              <QuickLink
                to="/admin/companies"
                label="Companies"
                desc="Create, edit, and manage Company accounts and their employees."
              />
              <QuickLink
                to="/admin/campaigns"
                label="Campaign Pipeline"
                desc="All campaigns across every Company — search, filter, and operate."
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  link,
  linkLabel,
  accent,
}: {
  label: string;
  value: number;
  sub: string;
  link: string;
  linkLabel: string;
  accent: string;
}) {
  return (
    <div style={{ ...styles.statCard, borderTop: `3px solid ${accent}` }}>
      <div style={{ ...styles.statValue, color: accent }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statSub}>{sub}</div>
      <Link to={link} style={{ ...styles.statLink, color: accent }}>
        {linkLabel}
      </Link>
    </div>
  );
}

function QuickLink({ to, label, desc }: { to: string; label: string; desc: string }) {
  return (
    <Link to={to} style={styles.quickCard}>
      <div style={styles.quickLabel}>{label}</div>
      <div style={styles.quickDesc}>{desc}</div>
    </Link>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { maxWidth: 1100 },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  adminBadge: {
    display: 'inline-block',
    fontSize: 9,
    fontWeight: 800,
    color: '#b2f24d',
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
  },
  title: { fontSize: 26, fontWeight: 900, color: '#0a1120', margin: '0 0 4px', letterSpacing: -0.5 },
  sub: { fontSize: 13, color: '#7a8bab', margin: 0 },
  muted: { color: '#7a8bab', fontSize: 14 },
  errMsg: { color: '#dc2626', fontSize: 14, marginBottom: 16 },

  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 28,
  },
  statCard: {
    background: '#ffffff',
    border: '1px solid #e8ecf3',
    borderRadius: 14,
    padding: '20px 24px',
  },
  statValue: { fontSize: 36, fontWeight: 900, lineHeight: 1, marginBottom: 6 },
  statLabel: { fontSize: 13, fontWeight: 700, color: '#0a1120', marginBottom: 2 },
  statSub: { fontSize: 11, color: '#7a8bab', marginBottom: 14 },
  statLink: { fontSize: 11, fontWeight: 700, textDecoration: 'none' },

  section: {
    background: '#ffffff',
    border: '1px solid #e8ecf3',
    borderRadius: 16,
    padding: '22px 24px',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 800,
    color: '#0a1120',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  sectionSub: { fontSize: 12, color: '#7a8bab', marginBottom: 14 },
  alertDot: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#dc2626',
  },

  statusGrid: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap' as const,
  },
  statusCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 4,
    background: '#f7f8fb',
    border: '1px solid #e8ecf3',
    borderRadius: 10,
    padding: '14px 20px',
    textDecoration: 'none',
    minWidth: 90,
    flex: '1 0 90px',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    marginBottom: 2,
  },
  statusCount: { fontSize: 22, fontWeight: 900, color: '#0a1120' },
  statusLabel: { fontSize: 10, fontWeight: 700, color: '#7a8bab', letterSpacing: 1 },

  tableWrap: { overflowX: 'auto' as const },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: {
    textAlign: 'left' as const,
    fontSize: 10,
    fontWeight: 800,
    color: '#7a8bab',
    letterSpacing: 0.5,
    padding: '8px 12px',
    borderBottom: '1px solid #e8ecf3',
    textTransform: 'uppercase' as const,
  },
  td: { padding: '10px 12px', fontSize: 12, color: '#0a1120', borderBottom: '1px solid #f1f4f9' },
  actionLink: { fontSize: 11, fontWeight: 700, color: '#b2f24d', textDecoration: 'none' },
  viewAllLink: {
    display: 'inline-block',
    marginTop: 14,
    fontSize: 11,
    fontWeight: 700,
    color: '#b2f24d',
    textDecoration: 'none',
  },
  statusPill: {
    fontSize: 9,
    fontWeight: 800,
    border: '1px solid',
    borderRadius: 3,
    padding: '2px 7px',
    letterSpacing: 1,
  },

  quickGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  quickCard: {
    background: '#f7f8fb',
    border: '1px solid #e8ecf3',
    borderRadius: 12,
    padding: '16px 20px',
    textDecoration: 'none',
  },
  quickLabel: { fontSize: 13, fontWeight: 700, color: '#0a1120', marginBottom: 4 },
  quickDesc: { fontSize: 11, color: '#7a8bab', lineHeight: 1.5 },
};

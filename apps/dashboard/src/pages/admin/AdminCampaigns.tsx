import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminCampaignsApi } from '../../api/adminEndpoints';
import type { AdminCampaign } from '../../api/types';

const STATUS_COLOR: Record<string, string> = {
  active: '#16a34a',
  draft: '#6b7fa8',
  paused: '#d97706',
  completed: '#2563eb',
  archived: '#4a5a7e',
};

const PAGE_SIZE = 20;

// Reference Product Benchmark, Operational Control (2026-09-02): a campaign
// still marked `active` whose endDate has already passed is no longer
// actually open to consumer participation — isCampaignOpenForParticipation()
// on the API already treats it as closed (campaign.entity.ts) — but nothing
// surfaced that to Admin as something to act on (mark it Completed). Purely
// client-side (the row already carries `status`/`endDate`, no backend
// change needed): a lightweight, honest "needs attention" signal computed
// from data that already exists, not a new field or a new business rule.
function needsAttention(c: { status: string; endDate: string | null }): boolean {
  if (c.status !== 'active' || !c.endDate) return false;
  const today = new Date().toISOString().slice(0, 10);
  return c.endDate < today;
}

// Founder ruling W-2 (2026-09-02): the global, cross-Company "Admin ->
// Campaigns" view — usable at the ~100-200 campaign scale this task
// requires: server-side pagination, search (product/brand name), and
// status filter, rather than a flat unpaginated list.
export default function AdminCampaigns() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') ?? '1');
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';

  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState(search);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    adminCampaignsApi
      .list({ page, limit: PAGE_SIZE, search: search || undefined, status: status || undefined })
      .then((res) => {
        setCampaigns(res.campaigns);
        setTotal(res.total);
      })
      .catch(() => setError('Failed to load campaigns.'))
      .finally(() => setLoading(false));
  }, [page, search, status]);

  useEffect(load, [load]);

  const updateParams = (next: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    if (!('page' in next)) params.set('page', '1');
    setSearchParams(params);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <h1 style={styles.title}>Campaigns</h1>
        <p style={styles.sub}>Every campaign across every Company — {total} total.</p>
      </div>

      <div style={styles.filters}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateParams({ search: searchInput });
          }}
        >
          <input
            style={styles.search}
            placeholder="Search product or brand name…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>
        <select
          style={styles.select}
          value={status}
          onChange={(e) => updateParams({ status: e.target.value })}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {loading && <div style={styles.muted}>Loading campaigns…</div>}
      {error && <div style={styles.errMsg}>{error}</div>}

      {!loading && !error && (
        <>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>Company</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Created</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id}>
                    <td style={styles.td}>
                      <Link to={`/admin/campaigns/${c.id}`} style={styles.campaignLink}>
                        {c.productName}
                      </Link>
                    </td>
                    <td style={styles.td}>{c.companyName ?? '—'}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusPill,
                          color: STATUS_COLOR[c.status] ?? '#4a5a7e',
                          borderColor: `${STATUS_COLOR[c.status] ?? '#4a5a7e'}55`,
                        }}
                      >
                        {c.status.toUpperCase()}
                      </span>
                      {needsAttention(c) && (
                        <span style={styles.attentionPill} title="Active, but its end date has already passed — consumers can no longer join. Consider marking it Completed.">
                          NEEDS ATTENTION
                        </span>
                      )}
                    </td>
                    <td style={styles.td}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {campaigns.length === 0 && (
                  <tr><td style={styles.td} colSpan={4}>No campaigns match these filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={styles.pagination}>
            <button
              style={styles.pageBtn}
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              ← Previous
            </button>
            <span style={styles.pageLabel}>Page {page} of {totalPages}</span>
            <button
              style={styles.pageBtn}
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { maxWidth: 960 },
  muted: { color: '#7a8bab', fontSize: 14 },
  errMsg: { color: '#dc2626', fontSize: 14 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 800, color: '#0a1120', margin: '0 0 6px', letterSpacing: -0.3 },
  sub: { fontSize: 13, color: '#4a5a7e', margin: 0 },
  filters: { display: 'flex', gap: 10, marginBottom: 16 },
  search: {
    background: '#ffffff', border: '1px solid #e8ecf3', borderRadius: 8, padding: '10px 14px',
    fontSize: 13, width: 320, outline: 'none',
  },
  select: {
    background: '#ffffff', border: '1px solid #e8ecf3', borderRadius: 8, padding: '10px 14px',
    fontSize: 13, outline: 'none',
  },
  tableWrap: { background: '#ffffff', border: '1px solid #e8ecf3', borderRadius: 14, overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: {
    textAlign: 'left' as const, fontSize: 10, fontWeight: 800, color: '#7a8bab', letterSpacing: 0.5,
    padding: '12px 16px', borderBottom: '1px solid #e8ecf3', textTransform: 'uppercase' as const,
  },
  td: { padding: '14px 16px', fontSize: 13, color: '#0a1120', borderBottom: '1px solid #f1f4f9' },
  campaignLink: { color: '#0a1120', fontWeight: 700, textDecoration: 'none' },
  statusPill: { fontSize: 9, fontWeight: 800, border: '1px solid', borderRadius: 4, padding: '3px 8px', letterSpacing: 0.5 },
  attentionPill: {
    fontSize: 9, fontWeight: 800, color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: 4, padding: '3px 8px', letterSpacing: 0.5, marginLeft: 6,
  },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 20 },
  pageBtn: {
    background: '#ffffff', border: '1px solid #e8ecf3', color: '#0a1120', borderRadius: 8,
    padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
  },
  pageLabel: { fontSize: 12, color: '#7a8bab', fontWeight: 600 },
};

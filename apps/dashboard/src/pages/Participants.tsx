import React, { useEffect, useState } from 'react';
import { analyticsApi, campaignApi } from '../api/endpoints';
import type { Participant } from '../api/types';

const PAGE_SIZE = 20;

export default function Participants() {
  const [campaignId, setCampaignId] = useState('');
  const [rows, setRows] = useState<Participant[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    campaignApi
      .getMyActiveCampaign()
      .then((c) => { setCampaignId(c.id); return c.id; })
      .then((id) => analyticsApi.getParticipants(id, 1))
      .then((r) => { setRows(r.participants); setTotal(r.total); })
      .catch(() => setError('Failed to load participants.'))
      .finally(() => setLoading(false));
  }, []);

  const goToPage = async (p: number) => {
    if (!campaignId) return;
    setLoading(true);
    try {
      const r = await analyticsApi.getParticipants(campaignId, p);
      setRows(r.participants);
      setPage(p);
    } catch {
      setError('Page load failed.');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div>
      <div style={styles.header}>
        <div>
          <span style={styles.demoBadge}>CONSUMERS</span>
          <h1 style={styles.title}>Participants</h1>
          <p style={styles.sub}>Anonymised consumer records from this trial campaign</p>
        </div>
        <div style={styles.totalBadge}>
          <span style={styles.totalNum}>{total}</span>
          <span style={styles.totalLabel}>total signals</span>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading participants…</div>
      ) : (
        <>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['#', 'Age Range', 'Gender', 'City', 'Survey', 'Time'].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((p, i) => (
                  <tr
                    key={p.id}
                    style={{ ...styles.tr, ...(i % 2 !== 0 ? styles.trAlt : {}) }}
                  >
                    <td style={styles.td}>
                      <span style={styles.rowNum}>{(page - 1) * PAGE_SIZE + i + 1}</span>
                    </td>
                    <td style={styles.td}>{p.ageRange ?? '—'}</td>
                    <td style={styles.td}>{p.gender ?? '—'}</td>
                    <td style={styles.td}>{p.city ?? '—'}</td>
                    <td style={styles.td}>
                      <span style={p.hasSurvey ? styles.badgeGreen : styles.badgeGray}>
                        {p.hasSurvey ? 'Complete' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: '#2e3d5e' }}>
                      {new Date(p.redeemedAt).toLocaleString('en-EG', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                style={{ ...styles.pageBtn, opacity: page <= 1 ? 0.4 : 1 }}
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                ← Prev
              </button>
              <span style={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button
                style={{ ...styles.pageBtn, opacity: page >= totalPages ? 0.4 : 1 }}
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: { color: '#2e3d5e', fontSize: 14, marginTop: 32 },
  error: { color: '#fb7185', fontSize: 14, marginTop: 32 },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
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
  title: {
    fontSize: 26,
    fontWeight: 800,
    color: '#edf0ff',
    margin: '4px 0 6px',
    letterSpacing: -0.3,
  },
  sub: { fontSize: 13, color: '#2e3d5e', margin: 0 },
  totalBadge: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 12,
    padding: '14px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  totalNum: { fontSize: 28, fontWeight: 900, color: '#b2f24d', lineHeight: 1 },
  totalLabel: { fontSize: 10, color: '#2e3d5e', marginTop: 4, letterSpacing: 0.5 },
  tableWrap: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 12,
    overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    background: '#040812',
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontSize: 10,
    fontWeight: 700,
    color: '#2e3d5e',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    borderBottom: '1px solid #111d35',
  },
  tr: {},
  trAlt: { background: 'rgba(255,255,255,0.01)' },
  td: {
    padding: '11px 16px',
    fontSize: 13,
    color: '#7c8eb8',
    borderBottom: '1px solid #0e1a2e',
  },
  rowNum: { fontSize: 11, color: '#2e3d5e', fontWeight: 600 },
  badgeGreen: {
    background: 'rgba(178, 242, 77, 0.1)',
    color: '#b2f24d',
    borderRadius: 4,
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  badgeGray: {
    background: '#0e1a2e',
    color: '#2e3d5e',
    borderRadius: 4,
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 600,
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  pageBtn: {
    background: '#0a1120',
    border: '1px solid #1a2540',
    color: '#7c8eb8',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  pageInfo: { fontSize: 12, color: '#2e3d5e' },
};

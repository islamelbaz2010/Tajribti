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
      .getDemoActive()
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
        <h1 style={styles.title}>Participants</h1>
        <span style={styles.badge}>{total} total</span>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading participants…</div>
      ) : (
        <>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['#', 'Age', 'Gender', 'City', 'Survey', 'Time'].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((p, i) => (
                  <tr key={p.id} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td style={styles.td}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td style={styles.td}>{p.ageRange ?? '—'}</td>
                    <td style={styles.td}>{p.gender ?? '—'}</td>
                    <td style={styles.td}>{p.city ?? '—'}</td>
                    <td style={styles.td}>
                      <span style={p.hasSurvey ? styles.badgeGreen : styles.badgeGray}>
                        {p.hasSurvey ? 'Done' : 'Pending'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(p.redeemedAt).toLocaleString('en-EG', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
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
                style={styles.pageBtn}
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                ← Prev
              </button>
              <span style={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button
                style={styles.pageBtn}
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
  loading: { color: '#666', fontSize: 16, marginTop: 40 },
  error: { color: '#e94560', fontSize: 15, marginTop: 40 },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 700, color: '#1a1a2e', margin: 0 },
  badge: {
    background: '#1a1a2e',
    color: '#fff',
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 13,
    fontWeight: 600,
  },
  tableWrap: {
    background: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    background: '#f8f9fa',
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 700,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: '1px solid #eee',
  },
  td: { padding: '12px 16px', fontSize: 14, color: '#333' },
  rowEven: {},
  rowOdd: { background: '#fafafa' },
  badgeGreen: {
    background: '#d1fae5',
    color: '#059669',
    borderRadius: 4,
    padding: '2px 8px',
    fontSize: 12,
    fontWeight: 600,
  },
  badgeGray: {
    background: '#f3f4f6',
    color: '#9ca3af',
    borderRadius: 4,
    padding: '2px 8px',
    fontSize: 12,
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
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  pageInfo: { fontSize: 14, color: '#666' },
};

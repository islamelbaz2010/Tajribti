import React, { useEffect, useState } from 'react';
import { campaignApi, reportApi } from '../api/endpoints';
import type { AiReport } from '../api/types';

export default function AiSummary() {
  const [report, setReport] = useState<AiReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    campaignApi
      .getDemoActive()
      .then((c) => reportApi.getAiSummary(c.id))
      .then(setReport)
      .catch(() => setError('Failed to generate AI summary.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={styles.title}>AI Summary</h1>

      {loading && (
        <div style={styles.loadingCard}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Generating insights from {0} responses…</p>
          <p style={styles.loadingHint}>This takes 3–8 seconds on first load</p>
        </div>
      )}

      {error && !loading && (
        <div style={styles.errorCard}>{error}</div>
      )}

      {report && !loading && (
        <div>
          <div style={styles.metaRow}>
            <span style={styles.meta}>Based on {report.responseCountAtGeneration} survey responses</span>
            <span style={styles.meta}>Generated {new Date(report.createdAt).toLocaleString('en-EG')}</span>
          </div>
          <div style={styles.reportCard}>
            <div style={styles.aiLabel}>
              <span style={styles.aiIcon}>AI</span>
              Consumer Intelligence Summary
            </div>
            <div style={styles.narrative}>
              {report.narrative.split('\n').map((line, i) => {
                if (!line.trim()) return <br key={i} />;
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <p key={i} style={styles.narrativeHeading}>{line.replace(/\*\*/g, '')}</p>;
                }
                if (line.startsWith('- ')) {
                  return <li key={i} style={styles.narrativeBullet}>{line.slice(2)}</li>;
                }
                return <p key={i} style={styles.narrativePara}>{line}</p>;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { fontSize: 28, fontWeight: 700, color: '#1a1a2e', marginBottom: 24 },
  loadingCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 48,
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid #f0f0f0',
    borderTop: '3px solid #1a1a2e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
  loadingText: { fontSize: 16, color: '#333', marginBottom: 4 },
  loadingHint: { fontSize: 13, color: '#aaa', margin: 0 },
  errorCard: {
    background: '#fff5f5',
    border: '1px solid #fecaca',
    borderRadius: 12,
    padding: 24,
    color: '#e94560',
    fontSize: 14,
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  meta: { fontSize: 13, color: '#aaa' },
  reportCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 32,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  aiLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: '#888',
    fontWeight: 600,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: '1px solid #f0f0f0',
  },
  aiIcon: {
    background: '#1a1a2e',
    color: '#fff',
    borderRadius: 6,
    padding: '2px 6px',
    fontSize: 11,
    fontWeight: 800,
  },
  narrative: { lineHeight: 1.8 },
  narrativePara: { color: '#333', fontSize: 15, margin: '0 0 12px' },
  narrativeHeading: { fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: '20px 0 8px' },
  narrativeBullet: {
    color: '#444',
    fontSize: 14,
    marginBottom: 6,
    paddingLeft: 4,
    listStyle: 'disc',
    marginLeft: 20,
  },
};

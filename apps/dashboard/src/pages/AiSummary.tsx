import React, { useEffect, useState } from 'react';
import { campaignApi, reportApi } from '../api/endpoints';
import type { AiReport } from '../api/types';

export default function AiSummary() {
  const [report, setReport] = useState<AiReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    campaignApi
      .getSelected()
      .then((c) => reportApi.getAiSummary(c.id))
      .then(setReport)
      .catch(() => setError('Failed to generate intelligence summary.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={styles.header}>
        <span style={styles.demoBadge}>CONSUMER INSIGHTS</span>
        <h1 style={styles.title}>AI Insights</h1>
        <p style={styles.sub}>
          What we learned — structured findings generated from consumer survey data
        </p>
      </div>

      {loading && (
        <div style={styles.loadingCard}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Processing survey data…</p>
          <p style={styles.loadingHint}>Generating intelligence summary from trial responses</p>
        </div>
      )}

      {error && !loading && (
        <div style={styles.errorCard}>{error}</div>
      )}

      {report && !loading && (
        <div>
          <div style={styles.metaRow}>
            <span style={styles.meta}>
              Based on {report.responseCountAtGeneration} survey responses
            </span>
            <span style={styles.meta}>
              {new Date(report.createdAt).toLocaleString('en-EG')}
            </span>
          </div>
          <div style={styles.reportCard}>
            <div style={styles.intelligenceBadge}>
              <span style={styles.intelligenceIcon}>INTELLIGENCE</span>
              Consumer Intelligence Summary
            </div>
            <div style={styles.narrative}>
              {report.narrative.split('\n').map((line, i) => {
                if (!line.trim()) return <br key={i} />;
                if (line.startsWith('**') && line.endsWith('**')) {
                  return (
                    <p key={i} style={styles.narrativeHeading}>
                      {line.replace(/\*\*/g, '')}
                    </p>
                  );
                }
                if (line.startsWith('- ')) {
                  return (
                    <li key={i} style={styles.narrativeBullet}>
                      {line.slice(2)}
                    </li>
                  );
                }
                return <p key={i} style={styles.narrativePara}>{line}</p>;
              })}
            </div>
          </div>

          <div style={styles.decisionCard}>
            <div style={styles.decisionLabel}>DECISION READY</div>
            <div style={styles.decisionDesc}>
              This intelligence is ready for brand action. Use the Campaign Report screen to export
              a PDF briefing for your marketing team.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: { marginBottom: 24 },
  demoBadge: {
    display: 'inline-block',
    fontSize: 9,
    fontWeight: 800,
    color: '#040812',
    background: '#b2f24d',
    borderRadius: 3,
    padding: '3px 8px',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    color: '#edf0ff',
    margin: '4px 0 6px',
    letterSpacing: -0.3,
  },
  sub: { fontSize: 13, color: '#2e3d5e', margin: 0 },
  loadingCard: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 14,
    padding: 48,
    textAlign: 'center' as const,
  },
  spinner: {
    width: 36,
    height: 36,
    border: '2px solid #111d35',
    borderTop: '2px solid #b2f24d',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
  loadingText: { fontSize: 15, color: '#7c8eb8', marginBottom: 4 },
  loadingHint: { fontSize: 12, color: '#2e3d5e', margin: 0 },
  errorCard: {
    background: 'rgba(251, 113, 133, 0.06)',
    border: '1px solid rgba(251, 113, 133, 0.2)',
    borderRadius: 12,
    padding: 24,
    color: '#fb7185',
    fontSize: 13,
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  meta: { fontSize: 12, color: '#2e3d5e' },
  reportCard: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 14,
    padding: 32,
    marginBottom: 16,
  },
  intelligenceBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 12,
    color: '#2e3d5e',
    fontWeight: 600,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: '1px solid #111d35',
  },
  intelligenceIcon: {
    background: '#b2f24d',
    color: '#040812',
    borderRadius: 4,
    padding: '3px 8px',
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 1.5,
  },
  narrative: { lineHeight: 1.8 },
  narrativePara: {
    color: '#7c8eb8',
    fontSize: 14,
    margin: '0 0 12px',
    lineHeight: 1.8,
  },
  narrativeHeading: {
    fontSize: 15,
    fontWeight: 700,
    color: '#edf0ff',
    margin: '20px 0 8px',
  },
  narrativeBullet: {
    color: '#7c8eb8',
    fontSize: 13,
    marginBottom: 6,
    paddingLeft: 4,
    listStyle: 'disc',
    marginLeft: 20,
  },
  decisionCard: {
    background: 'rgba(178, 242, 77, 0.05)',
    border: '1px solid rgba(178, 242, 77, 0.15)',
    borderRadius: 12,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
  },
  decisionLabel: {
    fontSize: 9,
    fontWeight: 800,
    color: '#b2f24d',
    letterSpacing: 2,
    whiteSpace: 'nowrap' as const,
    paddingTop: 2,
  },
  decisionDesc: {
    fontSize: 12,
    color: '#4a5a7e',
    lineHeight: 1.6,
  },
};

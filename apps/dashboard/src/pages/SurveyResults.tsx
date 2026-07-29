import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { analyticsApi, campaignApi } from '../api/endpoints';
import type { SurveyData } from '../api/types';

const COLORS = ['#1a1a2e', '#e94560', '#0f3460', '#533483', '#16213e'];

export default function SurveyResults() {
  const [data, setData] = useState<SurveyData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    campaignApi
      .getDemoActive()
      .then((c) => analyticsApi.getSurvey(c.id))
      .then(setData)
      .catch(() => setError('Failed to load survey data.'));
  }, []);

  if (error) return <div style={styles.error}>{error}</div>;
  if (!data) return <div style={styles.loading}>Loading survey results…</div>;

  const intentData = data.purchaseIntentDistribution;
  const descriptorData = data.questionBreakdown['q3'] ?? [];

  return (
    <div>
      <h1 style={styles.title}>Survey Results</h1>

      <div style={styles.scoreRow}>
        <div style={styles.scoreCard}>
          <span style={styles.scoreValue}>{data.purchaseIntentScore}</span>
          <span style={styles.scoreLabel}>Purchase Intent Score</span>
          <span style={styles.scoreMax}>/100</span>
        </div>
        <div style={styles.intentBars}>
          {intentData.map((item) => (
            <div key={item.label} style={styles.intentRow}>
              <span style={styles.intentLabel}>{item.label}</span>
              <div style={styles.barTrack}>
                <div
                  style={{
                    ...styles.barFill,
                    width: `${item.percentage}%`,
                    background: item.label === 'Would Buy' ? '#1a1a2e' : item.label === 'Probably' ? '#0f3460' : '#ccc',
                  }}
                />
              </div>
              <span style={styles.intentPct}>{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Product Descriptor (Q3)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={descriptorData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {descriptorData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Open Feedback (Q5)</h2>
          {data.verbatims.length === 0 ? (
            <p style={styles.empty}>No open-ended responses yet.</p>
          ) : (
            <div style={styles.verbatims}>
              {data.verbatims.map((v, i) => (
                <div key={i} style={styles.verbatim}>
                  <span style={styles.quoteChar}>"</span>
                  {v}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: { color: '#666', fontSize: 16, marginTop: 40 },
  error: { color: '#e94560', fontSize: 15, marginTop: 40 },
  title: { fontSize: 28, fontWeight: 700, color: '#1a1a2e', marginBottom: 24 },
  scoreRow: {
    display: 'flex',
    gap: 24,
    marginBottom: 24,
    alignItems: 'stretch',
  },
  scoreCard: {
    background: '#1a1a2e',
    borderRadius: 12,
    padding: '28px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
  },
  scoreValue: { fontSize: 56, fontWeight: 900, color: '#fff', lineHeight: 1 },
  scoreLabel: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 8, textAlign: 'center' },
  scoreMax: { fontSize: 18, color: '#e94560', fontWeight: 700, marginTop: 4 },
  intentBars: {
    flex: 1,
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 14,
  },
  intentRow: { display: 'flex', alignItems: 'center', gap: 12 },
  intentLabel: { width: 90, fontSize: 13, color: '#555', fontWeight: 500 },
  barTrack: { flex: 1, height: 10, background: '#f0f0f0', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5, transition: 'width 0.6s ease' },
  intentPct: { width: 40, fontSize: 13, color: '#333', fontWeight: 700, textAlign: 'right' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginTop: 0, marginBottom: 16 },
  empty: { color: '#aaa', fontSize: 14 },
  verbatims: { display: 'flex', flexDirection: 'column', gap: 12 },
  verbatim: {
    background: '#f9f9f9',
    borderLeft: '3px solid #e94560',
    padding: '10px 14px',
    borderRadius: '0 8px 8px 0',
    fontSize: 14,
    color: '#333',
    lineHeight: 1.5,
  },
  quoteChar: { color: '#e94560', fontWeight: 700, marginRight: 4 },
};

import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { analyticsApi, campaignApi } from '../api/endpoints';
import type { SurveyData } from '../api/types';

const COLORS = ['#b2f24d', '#38bdf8', '#fb7185', '#a78bfa', '#fbbf24'];

const CHART_TOOLTIP = {
  contentStyle: {
    background: '#0c1526',
    border: '1px solid #1a2540',
    color: '#edf0ff',
    borderRadius: 6,
    fontSize: 12,
  },
  itemStyle: { color: '#edf0ff' },
  labelStyle: { color: '#7c8eb8', marginBottom: 4 },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
};

export default function SurveyResults() {
  const [data, setData] = useState<SurveyData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    campaignApi
      .getSelected()
      .then((c) => analyticsApi.getSurvey(c.id))
      .then(setData)
      .catch(() => setError('Failed to load survey data.'));
  }, []);

  if (error) return <div style={styles.error}>{error}</div>;
  if (!data) return <div style={styles.loading}>Loading survey signals…</div>;

  const intentData = data.purchaseIntentDistribution;
  const descriptorData = data.questionBreakdown['q3'] ?? [];

  return (
    <div>
      <div style={styles.header}>
        <span style={styles.demoBadge}>CONSUMER INSIGHTS</span>
        <h1 style={styles.title}>Survey Results</h1>
        <p style={styles.sub}>What consumers said — purchase intent, product perception, and open feedback</p>
      </div>

      <div style={styles.scoreRow}>
        <div style={styles.scoreCard}>
          <div style={styles.scoreLabel}>Purchase Intent Score</div>
          <div style={styles.scoreValue}>{data.purchaseIntentScore}</div>
          <div style={styles.scoreMax}>/100</div>
        </div>

        <div style={styles.intentBars}>
          <div style={styles.intentTitle}>Purchase Intent Distribution</div>
          {intentData.map((item) => {
            const isTop = item.label === 'Would Buy';
            const isSecond = item.label === 'Probably';
            const barColor = isTop ? '#b2f24d' : isSecond ? '#38bdf8' : '#1a2540';
            return (
              <div key={item.label} style={styles.intentRow}>
                <span style={styles.intentLabel}>{item.label}</span>
                <div style={styles.barTrack}>
                  <div
                    style={{
                      ...styles.barFill,
                      width: `${item.percentage}%`,
                      background: barColor,
                    }}
                  />
                </div>
                <span style={{ ...styles.intentPct, color: isTop ? '#b2f24d' : '#7c8eb8' }}>
                  {item.percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Product Descriptor (Q3)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={descriptorData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#3d4a6a' }}
                axisLine={{ stroke: '#1a2540' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#3d4a6a' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip {...CHART_TOOLTIP} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {descriptorData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Open Feedback (Q5)</div>
          {data.verbatims.length === 0 ? (
            <div style={styles.emptyWrap}>
              <p style={styles.empty}>No open-ended responses in this demo scenario.</p>
              <p style={styles.emptyHint}>
                In a live campaign, consumer verbatims appear here when respondents answer Q5.
              </p>
            </div>
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
  loading: { color: '#2e3d5e', fontSize: 14, marginTop: 32 },
  error: { color: '#fb7185', fontSize: 14, marginTop: 32 },
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
  scoreRow: {
    display: 'flex',
    gap: 20,
    marginBottom: 20,
    alignItems: 'stretch',
  },
  scoreCard: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 14,
    padding: '28px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#2e3d5e',
    letterSpacing: 1.2,
    textAlign: 'center' as const,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: 900,
    color: '#b2f24d',
    lineHeight: 1,
  },
  scoreMax: { fontSize: 16, color: '#2e3d5e', fontWeight: 600, marginTop: 4 },
  intentBars: {
    flex: 1,
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 14,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 14,
  },
  intentTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#2e3d5e',
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    marginBottom: 4,
  },
  intentRow: { display: 'flex', alignItems: 'center', gap: 12 },
  intentLabel: { width: 90, fontSize: 12, color: '#7c8eb8', fontWeight: 500 },
  barTrack: {
    flex: 1,
    height: 8,
    background: '#0e1a2e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4, transition: 'width 0.6s ease' },
  intentPct: { width: 40, fontSize: 12, fontWeight: 700, textAlign: 'right' as const },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  card: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 14,
    padding: 24,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#2e3d5e',
    letterSpacing: 1.5,
    marginBottom: 16,
    textTransform: 'uppercase' as const,
  },
  emptyWrap: { paddingTop: 8 },
  empty: { color: '#2e3d5e', fontSize: 13, margin: '0 0 8px' },
  emptyHint: { color: '#1a2540', fontSize: 11, margin: 0, lineHeight: 1.5 },
  verbatims: { display: 'flex', flexDirection: 'column', gap: 10 },
  verbatim: {
    background: '#070c1a',
    borderLeft: '2px solid #b2f24d',
    padding: '10px 14px',
    borderRadius: '0 8px 8px 0',
    fontSize: 13,
    color: '#7c8eb8',
    lineHeight: 1.6,
  },
  quoteChar: { color: '#b2f24d', fontWeight: 700, marginRight: 4 },
};

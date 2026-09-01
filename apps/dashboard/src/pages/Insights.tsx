import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { analyticsApi, campaignApi } from '../api/endpoints';
import type { DemographicsData } from '../api/types';

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

const AXIS_TICK = { fontSize: 11, fill: '#3d4a6a' };
const AXIS_LINE = { stroke: '#1a2540' };

export default function Insights() {
  const [data, setData] = useState<DemographicsData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    campaignApi
      .getSelected()
      .then((c) => analyticsApi.getDemographics(c.id))
      .then(setData)
      .catch(() => setError('Failed to load demographics.'));
  }, []);

  if (error) return <div style={styles.error}>{error}</div>;
  if (!data) return <div style={styles.loading}>Loading demographic signals…</div>;

  const totalParticipants = data.ageDistribution.reduce((s, r) => s + r.count, 0);

  return (
    <div>
      <div style={styles.header}>
        <span style={styles.demoBadge}>CONSUMER INSIGHTS</span>
        <h1 style={styles.title}>Demographics</h1>
        <p style={styles.sub}>
          Who tried this campaign — demographic profile of {totalParticipants} consumers
        </p>
      </div>

      {totalParticipants === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyTitle}>No demographic data yet</div>
          <p style={styles.emptyBody}>
            Age, gender, and city breakdowns appear here once consumers start trying this
            campaign and completing the survey.
          </p>
        </div>
      ) : (
      <>
      <div style={styles.chartsGrid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Age Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.ageDistribution} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barCategoryGap="30%">
              <XAxis dataKey="label" tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP} formatter={(v) => [`${v ?? 0}`, 'Participants']} />
              <Bar dataKey="count" fill="#b2f24d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Gender Split</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.genderDistribution}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry: any) =>
                  `${entry.label ?? ''} ${Math.round((entry.percent ?? 0) * 100)}%`
                }
                labelLine={{ stroke: '#1a2540' }}
              >
                {data.genderDistribution.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...CHART_TOOLTIP} formatter={(v) => [`${v ?? 0}`, 'Participants']} />
            </PieChart>
          </ResponsiveContainer>
          <div style={styles.legend}>
            {data.genderDistribution.map((d, i) => (
              <div key={d.label} style={styles.legendItem}>
                <div style={{ ...styles.legendDot, background: COLORS[i % COLORS.length] }} />
                <span style={styles.legendLabel}>{d.label}</span>
                <span style={styles.legendCount}>{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...styles.card, ...styles.cardWide }}>
          <div style={styles.cardTitle}>City Distribution</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.cityDistribution} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barCategoryGap="35%">
              <XAxis dataKey="label" tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP} formatter={(v) => [`${v ?? 0}`, 'Participants']} />
              <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {data.ageDistribution.length > 0 && data.genderDistribution.length > 0 && (
        <div style={styles.segmentCard}>
          <div style={styles.segmentRow}>
            <div style={styles.segmentStat}>
              <div style={styles.segmentLabel}>LARGEST AGE GROUP</div>
              <div style={styles.segmentValue}>
                {data.ageDistribution[0]?.label}
              </div>
              <div style={styles.segmentDesc}>
                {data.ageDistribution[0]?.count} participants · {data.ageDistribution[0]?.percentage}% of trial cohort
              </div>
            </div>
            <div style={styles.segmentDivider} />
            <div style={styles.segmentStat}>
              <div style={styles.segmentLabel}>GENDER SPLIT</div>
              <div style={styles.segmentValue}>
                {data.genderDistribution.map((g, i) => (
                  <span key={g.label}>
                    {i > 0 && <span style={styles.segmentSep}> · </span>}
                    {g.percentage}% {g.label}
                  </span>
                ))}
              </div>
              <div style={styles.segmentDesc}>
                Independent distributions — not cross-tabulated
              </div>
            </div>
          </div>
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
  emptyState: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 12,
    padding: '32px 28px',
  },
  emptyTitle: { fontSize: 15, fontWeight: 700, color: '#edf0ff', marginBottom: 8 },
  emptyBody: { fontSize: 13, color: '#4a5a7e', lineHeight: 1.6, margin: 0, maxWidth: 480 },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 16,
  },
  card: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 14,
    padding: '20px 24px',
  },
  cardWide: { gridColumn: '1 / -1' },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#2e3d5e',
    letterSpacing: 1.5,
    marginBottom: 16,
    textTransform: 'uppercase' as const,
  },
  legend: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  legendLabel: { fontSize: 12, color: '#7c8eb8', flex: 1 },
  legendCount: { fontSize: 12, color: '#edf0ff', fontWeight: 600 },
  segmentCard: {
    background: 'rgba(178, 242, 77, 0.05)',
    border: '1px solid rgba(178, 242, 77, 0.15)',
    borderRadius: 14,
    padding: '20px 24px',
  },
  segmentRow: {
    display: 'flex',
    gap: 24,
    alignItems: 'flex-start',
  },
  segmentStat: {
    flex: 1,
  },
  segmentDivider: {
    width: 1,
    alignSelf: 'stretch',
    background: 'rgba(178, 242, 77, 0.12)',
    flexShrink: 0,
  },
  segmentLabel: {
    fontSize: 9,
    fontWeight: 800,
    color: '#b2f24d',
    letterSpacing: 2,
    marginBottom: 6,
  },
  segmentValue: {
    fontSize: 20,
    fontWeight: 800,
    color: '#edf0ff',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  segmentSep: { color: '#1a2540' },
  segmentDesc: { fontSize: 11, color: '#4a5a7e', lineHeight: 1.6 },
};

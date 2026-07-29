import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { analyticsApi, campaignApi } from '../api/endpoints';
import type { DemographicsData } from '../api/types';

const COLORS = ['#1a1a2e', '#e94560', '#0f3460', '#533483', '#16213e'];

export default function Insights() {
  const [data, setData] = useState<DemographicsData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    campaignApi
      .getDemoActive()
      .then((c) => analyticsApi.getDemographics(c.id))
      .then(setData)
      .catch(() => setError('Failed to load demographics.'));
  }, []);

  if (error) return <div style={styles.error}>{error}</div>;
  if (!data) return <div style={styles.loading}>Loading demographics…</div>;

  return (
    <div>
      <h1 style={styles.title}>Demographics</h1>

      <div style={styles.grid}>
        <ChartCard title="Age Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.ageDistribution} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v ?? 0}`, 'Participants']} />
              <Bar dataKey="count" fill="#1a1a2e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Gender Split">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.genderDistribution}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${(entry as any).label ?? ''} ${Math.round(((entry as any).percent ?? 0) * 100)}%`}
                labelLine={false}
              >
                {data.genderDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip formatter={(v) => [`${v ?? 0}`, 'Participants']} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="City Distribution" wide>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.cityDistribution} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v ?? 0}`, 'Participants']} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.cityDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div style={{ ...styles.card, ...(wide ? styles.cardWide : {}) }}>
      <h2 style={styles.cardTitle}>{title}</h2>
      {children}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: { color: '#666', fontSize: 16, marginTop: 40 },
  error: { color: '#e94560', fontSize: 15, marginTop: 40 },
  title: { fontSize: 28, fontWeight: 700, color: '#1a1a2e', marginBottom: 24 },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardWide: { gridColumn: '1 / -1' },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginTop: 0, marginBottom: 16 },
};

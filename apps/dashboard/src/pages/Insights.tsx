import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
import type { DemographicsData, SurveyData } from '../api/types';

const COLORS = ['#b2f24d', '#38bdf8', '#fb7185', '#a78bfa', '#fbbf24'];

const CHART_TOOLTIP = {
  contentStyle: {
    background: '#0c1526',
    border: '1px solid #dde3ee',
    color: '#0a1120',
    borderRadius: 6,
    fontSize: 12,
  },
  itemStyle: { color: '#0a1120' },
  labelStyle: { color: '#4a5a7e', marginBottom: 4 },
  cursor: { fill: 'rgba(10,17,32,0.04)' },
};

const AXIS_TICK = { fontSize: 11, fill: '#3d4a6a' };
const AXIS_LINE = { stroke: '#1a2540' };

// DL-106 (2026-09-06): signal cards — top-line survey quality signals
// displayed at the head of the Insights page so WHO connects immediately
// to WHAT THEY THINK and WHAT THEY INTEND, closing the benchmark's
// Insight Model chain on a single page rather than requiring navigation
// across Demographics → Survey Results → AI Insights.
function SignalCard({ label, value, sub, accent }: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div style={{ ...styles.signalCard, ...(accent ? styles.signalCardAccent : {}) }}>
      <div style={styles.signalLabel}>{label}</div>
      <div style={{ ...styles.signalValue, ...(accent ? { color: '#b2f24d' } : {}) }}>{value}</div>
      {sub && <div style={styles.signalSub}>{sub}</div>}
    </div>
  );
}

// DL-106: star display for q1 first impression average.
function StarRating({ average }: { average: number }) {
  const full = Math.floor(average);
  const half = average - full >= 0.4;
  return (
    <span style={{ fontSize: 13, letterSpacing: 1 }}>
      {Array.from({ length: 5 }, (_, i) => {
        if (i < full) return <span key={i} style={{ color: '#fbbf24' }}>★</span>;
        if (i === full && half) return <span key={i} style={{ color: '#fbbf24', opacity: 0.55 }}>★</span>;
        return <span key={i} style={{ color: '#d0d7e6' }}>★</span>;
      })}
    </span>
  );
}

// DL-106: purchase intent by segment — one row per label/gender/age group.
// respondentCount is always shown so the brand can assess confidence.
// Only rendered when the segment has ≥1 respondent.
function SegmentTable({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; respondentCount: number; positiveIntentPercent: number }[];
}) {
  const validRows = rows.filter((r) => r.respondentCount > 0);
  if (validRows.length === 0) return null;

  return (
    <div style={styles.segmentTableWrap}>
      <div style={styles.segmentTableTitle}>{title}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e8ecf3' }}>
            <th style={{ textAlign: 'left', padding: '5px 8px', color: '#7a8bab', fontWeight: 600 }}>Segment</th>
            <th style={{ textAlign: 'right', padding: '5px 8px', color: '#7a8bab', fontWeight: 600 }}>Purchase Intent</th>
            <th style={{ textAlign: 'right', padding: '5px 8px', color: '#7a8bab', fontWeight: 600 }}>Respondents</th>
          </tr>
        </thead>
        <tbody>
          {validRows.map((r) => (
            <tr key={r.label} style={{ borderBottom: '1px solid #f0f3fa' }}>
              <td style={{ padding: '7px 8px', color: '#0a1120', fontWeight: 600 }}>{r.label}</td>
              <td style={{ padding: '7px 8px', textAlign: 'right' }}>
                <span style={{
                  fontWeight: 800,
                  color: r.positiveIntentPercent >= 60 ? '#b2f24d' :
                         r.positiveIntentPercent >= 40 ? '#fbbf24' : '#fb7185',
                }}>
                  {r.positiveIntentPercent}%
                </span>
              </td>
              <td style={{ padding: '7px 8px', textAlign: 'right', color: '#7a8bab' }}>
                n={r.respondentCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {validRows.some((r) => r.respondentCount < 10) && (
        <p style={{ fontSize: 10, color: '#7a8bab', margin: '6px 0 0', fontStyle: 'italic' }}>
          Segments with fewer than 10 respondents should be interpreted with caution.
        </p>
      )}
    </div>
  );
}

export default function Insights() {
  const location = useLocation();
  const [demo, setDemo] = useState<DemographicsData | null>(null);
  // DL-106: survey data loaded in parallel for signal cards + segment table.
  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Re-resolves whenever ?campaignId= changes — this route doesn't
    // remount on a query-string change alone (same fix as Overview.tsx/
    // Gallery.tsx/CampaignDetail.tsx).
    setDemo(null);
    setSurvey(null);
    setError('');
    campaignApi
      .getSelected()
      .then((c) =>
        Promise.all([
          analyticsApi.getDemographics(c.id),
          analyticsApi.getSurvey(c.id),
        ]),
      )
      .then(([d, s]) => {
        setDemo(d);
        setSurvey(s);
      })
      .catch(() => setError('Failed to load insights.'));
  }, [location.search]);

  if (error) return <div style={styles.error}>{error}</div>;
  if (!demo) return <div style={styles.loading}>Loading demographic signals…</div>;

  const totalParticipants = demo.ageDistribution.reduce((s, r) => s + r.count, 0);

  // DL-106: survey signals — only surface when there are respondents.
  // firstImpressionScore comes from q1 (stars, avg 1-5); purchaseIntentScore
  // is the % of respondents who answered 4-5 on the 1-5 purchase intent scale.
  const hasSurveySignals = survey && survey.firstImpressionScore?.responseCount > 0;
  const surveyCompletions = hasSurveySignals ? survey!.firstImpressionScore.responseCount : 0;
  const completionRate = totalParticipants > 0
    ? Math.round((surveyCompletions / totalParticipants) * 100)
    : 0;

  const hasByGender = survey?.purchaseIntentBySegment?.byGender?.some((r) => r.respondentCount > 0);
  const hasByAge = survey?.purchaseIntentBySegment?.byAgeRange?.some((r) => r.respondentCount > 0);

  return (
    <div>
      {/* DL-113 (2026-09-06): page title aligned with nav label "Insights"
          and the full benchmark chain: WHO → THINK → INTEND → SEGMENTS.
          The sub clarifies scope without the misleading "Demographics" framing
          that understated what this page now covers post-DL-106. */}
      <div style={styles.header}>
        <span style={styles.demoBadge}>CONSUMER INSIGHTS</span>
        <h1 style={styles.title}>Insights</h1>
        <p style={styles.sub}>
          WHO tried this — what they think, what they intend, and how segments differ
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
        {/* DL-106: Signal cards — top-line quality signals connecting WHO to
            WHAT THEY THINK (first impression) and WHAT THEY INTEND (purchase
            intent). Survey completion rate shown so the brand can assess
            whether the signal sample is representative. */}
        {hasSurveySignals && (
          <div style={styles.signalRow}>
            <SignalCard
              label="First Impression"
              value={survey!.firstImpressionScore.average.toFixed(1)}
              sub={<><StarRating average={survey!.firstImpressionScore.average} /> avg rating (q1)</> as any}
            />
            <SignalCard
              label="Purchase Intent"
              value={`${survey!.purchaseIntentScore}%`}
              sub="likely to buy (q2 scores 4-5)"
              accent
            />
            <SignalCard
              label="Survey Completion"
              value={`${completionRate}%`}
              sub={`${surveyCompletions} of ${totalParticipants} participants responded`}
            />
          </div>
        )}

      <div style={styles.chartsGrid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Age Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={demo.ageDistribution} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barCategoryGap="30%">
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
                data={demo.genderDistribution}
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
                {demo.genderDistribution.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...CHART_TOOLTIP} formatter={(v) => [`${v ?? 0}`, 'Participants']} />
            </PieChart>
          </ResponsiveContainer>
          <div style={styles.legend}>
            {demo.genderDistribution.map((d, i) => (
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
            <BarChart data={demo.cityDistribution} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barCategoryGap="35%">
              <XAxis dataKey="label" tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP} formatter={(v) => [`${v ?? 0}`, 'Participants']} />
              <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {demo.ageDistribution.length > 0 && demo.genderDistribution.length > 0 && (
        <div style={styles.segmentCard}>
          <div style={styles.segmentRow}>
            <div style={styles.segmentStat}>
              <div style={styles.segmentLabel}>LARGEST AGE GROUP</div>
              <div style={styles.segmentValue}>
                {demo.ageDistribution[0]?.label}
              </div>
              <div style={styles.segmentDesc}>
                {demo.ageDistribution[0]?.count} participants · {demo.ageDistribution[0]?.percentage}% of trial cohort
              </div>
            </div>
            <div style={styles.segmentDivider} />
            <div style={styles.segmentStat}>
              <div style={styles.segmentLabel}>GENDER SPLIT</div>
              <div style={styles.segmentValue}>
                {demo.genderDistribution.map((g, i) => (
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

      {/* DL-106: Purchase Intent by Segment — Sampl benchmark: "Review rate
          and purchase intent can be viewed by audience segment." Zamplit:
          "Insights include...audience differences." Only rendered when the
          segment data from the API carries at least one respondent per group;
          caution note added for segments with n<10 to preserve the product's
          existing evidence-discipline rules. */}
      {(hasByGender || hasByAge) && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Purchase Intent by Segment</div>
          <p style={{ fontSize: 11, color: '#7a8bab', margin: '0 0 16px' }}>
            How purchase intent (q2 scores 4-5) differs across audience groups in this campaign.
          </p>
          <div style={styles.segmentTablesRow}>
            {hasByGender && (
              <SegmentTable
                title="By Gender"
                rows={survey!.purchaseIntentBySegment.byGender}
              />
            )}
            {hasByAge && (
              <SegmentTable
                title="By Age Range"
                rows={survey!.purchaseIntentBySegment.byAgeRange}
              />
            )}
          </div>
        </div>
      )}

      {/* DL-113 (2026-09-06): Consumer Voice — Q3 descriptor word distribution.
          This is the most memorable consumer signal: the single word they chose
          to describe the product. Shown on the Insights page (not only Survey
          Results) so the brand sees WHO + WHAT THEY SAID on one screen.
          Only shown when the survey has Q3 responses. No new API call —
          survey is already fetched above. */}
      {(() => {
        const q3 = survey?.questionBreakdown?.['q3'];
        if (!q3 || q3.length === 0) return null;
        const total = q3.reduce((s, r) => s + r.count, 0);
        if (total === 0) return null;
        const sorted = [...q3].sort((a, b) => b.count - a.count);
        return (
          <div style={styles.voiceCard}>
            <div style={styles.cardTitle}>Consumer Voice</div>
            <p style={{ fontSize: 11, color: '#7a8bab', margin: '0 0 16px' }}>
              The word consumers chose to describe this product (q3, n={total})
            </p>
            <div style={styles.voiceRow}>
              {sorted.map((r, i) => {
                const pct = Math.round((r.count / total) * 100);
                const isTop = i === 0;
                return (
                  <div key={r.label} style={{ ...styles.voiceWord, ...(isTop ? styles.voiceWordTop : {}) }}>
                    <span style={{ ...styles.voiceLabel, ...(isTop ? { color: '#040812' } : {}) }}>
                      {r.label}
                    </span>
                    <span style={{ ...styles.voicePct, ...(isTop ? { color: '#040812', fontWeight: 800 } : {}) }}>
                      {pct}%
                    </span>
                    <span style={styles.voiceCount}>n={r.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
      </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: { color: '#7a8bab', fontSize: 14, marginTop: 32 },
  error: { color: '#dc2626', fontSize: 14, marginTop: 32 },
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
    color: '#0a1120',
    margin: '4px 0 6px',
    letterSpacing: -0.3,
  },
  sub: { fontSize: 13, color: '#7a8bab', margin: 0 },
  emptyState: {
    background: '#ffffff',
    border: '1px solid #e8ecf3',
    borderRadius: 12,
    padding: '32px 28px',
  },
  emptyTitle: { fontSize: 15, fontWeight: 700, color: '#0a1120', marginBottom: 8 },
  emptyBody: { fontSize: 13, color: '#4a5a7e', lineHeight: 1.6, margin: 0, maxWidth: 480 },
  // DL-106: signal cards row
  signalRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 12,
    marginBottom: 16,
  },
  signalCard: {
    background: '#ffffff',
    border: '1px solid #e8ecf3',
    borderRadius: 14,
    padding: '16px 20px',
  },
  signalCardAccent: {
    background: 'rgba(178,242,77,0.06)',
    border: '1px solid rgba(178,242,77,0.2)',
  },
  signalLabel: {
    fontSize: 9,
    fontWeight: 800,
    color: '#7a8bab',
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  },
  signalValue: {
    fontSize: 28,
    fontWeight: 800,
    color: '#0a1120',
    lineHeight: 1,
    marginBottom: 4,
  },
  signalSub: { fontSize: 10, color: '#7a8bab', lineHeight: 1.5 },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 16,
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e8ecf3',
    borderRadius: 14,
    padding: '20px 24px',
    marginBottom: 16,
  },
  cardWide: { gridColumn: '1 / -1' },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#7a8bab',
    letterSpacing: 1.5,
    marginBottom: 16,
    textTransform: 'uppercase' as const,
  },
  legend: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  legendLabel: { fontSize: 12, color: '#4a5a7e', flex: 1 },
  legendCount: { fontSize: 12, color: '#0a1120', fontWeight: 600 },
  segmentCard: {
    background: 'rgba(178, 242, 77, 0.05)',
    border: '1px solid rgba(178, 242, 77, 0.15)',
    borderRadius: 14,
    padding: '20px 24px',
    marginBottom: 16,
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
    color: '#0a1120',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  segmentSep: { color: '#94a3b8' },
  segmentDesc: { fontSize: 11, color: '#4a5a7e', lineHeight: 1.6 },
  // DL-106: purchase intent by segment tables
  segmentTablesRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  segmentTableWrap: {
    background: '#f7f9fd',
    borderRadius: 10,
    padding: '14px 16px',
  },
  segmentTableTitle: {
    fontSize: 10,
    fontWeight: 800,
    color: '#7a8bab',
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    marginBottom: 10,
  },
  // DL-113: Consumer Voice card — Q3 word descriptor distribution
  voiceCard: {
    background: '#ffffff',
    border: '1px solid #e8ecf3',
    borderRadius: 14,
    padding: '20px 24px',
    marginBottom: 16,
  },
  voiceRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  voiceWord: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 2,
    background: '#f7f9fd',
    borderRadius: 10,
    padding: '10px 16px',
    minWidth: 80,
  },
  voiceWordTop: {
    background: '#b2f24d',
  },
  voiceLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: '#0a1120',
  },
  voicePct: {
    fontSize: 18,
    fontWeight: 700,
    color: '#4a5a7e',
    lineHeight: 1,
  },
  voiceCount: {
    fontSize: 9,
    color: '#7a8bab',
  },
};

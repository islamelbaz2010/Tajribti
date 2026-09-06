import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { analyticsApi, campaignApi } from '../api/endpoints';
import type { Campaign, SurveyData } from '../api/types';

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

// DL-114 (2026-09-06): resolve the actual question text for a canonical
// question id from the campaign's own surveyQuestions definition.
// Falls back to the hardcoded semantic label when the campaign is not yet
// loaded — identical visual result to pre-DL-114 until the campaign resolves.
// This closes the question-identity traceability gap: a brand viewing Survey
// Results now sees the exact question text their consumers saw, not a generic
// category label like "First Impression (Q1)".
function qLabel(campaign: Campaign | null, id: string, fallback: string): string {
  if (!campaign) return fallback;
  const q = campaign.surveyQuestions?.find((q) => q.id === id);
  return q ? q.text : fallback;
}

export default function SurveyResults() {
  const location = useLocation();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [data, setData] = useState<SurveyData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // DL-114: load campaign alongside survey analytics so we can resolve
    // actual question text for Q1–Q5. Campaign is loaded once per
    // ?campaignId= change — same trigger as the analytics call below.
    // Re-resolves whenever ?campaignId= changes — see CampaignDetail.tsx.
    setCampaign(null);
    setData(null);
    setError('');
    campaignApi
      .getSelected()
      .then((c) => {
        setCampaign(c);
        return analyticsApi.getSurvey(c.id);
      })
      .then(setData)
      .catch(() => setError('Failed to load survey data.'));
  }, [location.search]);

  if (error) return <div style={styles.error}>{error}</div>;
  if (!data) return <div style={styles.loading}>Loading survey signals…</div>;

  const intentData = data.purchaseIntentDistribution;
  const descriptorData = data.questionBreakdown['q3'] ?? [];
  // Product Completion Wave (2026-09-02): q1 (first impression) and q4
  // (compared to similar products) are part of every campaign's default
  // survey — same as q2/q3/q5 above — and were captured all along but
  // never rendered here. Additive only: nothing above this line changed.
  const comparisonData = data.questionBreakdown['q4'] ?? [];
  const totalResponses = intentData.reduce((sum, item) => sum + item.count, 0);

  // DL-114: actual question text from campaign definition for each core question.
  const q1Label = qLabel(campaign, 'q1', 'First Impression');
  const q2Label = qLabel(campaign, 'q2', 'Purchase Intent');
  const q3Label = qLabel(campaign, 'q3', 'Product Descriptor');
  const q4Label = qLabel(campaign, 'q4', 'Compared to Similar Products');
  const q5Label = qLabel(campaign, 'q5', 'Open Feedback');

  return (
    <div>
      <div style={styles.header}>
        <span style={styles.demoBadge}>CONSUMER INSIGHTS</span>
        <h1 style={styles.title}>Survey Results</h1>
        <p style={styles.sub}>What consumers said — purchase intent, product perception, and open feedback</p>
      </div>

      {/* DL-114: campaign objective as research context — closes the
          Objective → Evidence traceability gap. Only shown when the campaign
          has a set objective; omitted silently when null/empty. */}
      {campaign?.objective && (
        <div style={styles.objectiveBar}>
          <span style={styles.objectiveBarLabel}>RESEARCH OBJECTIVE</span>
          <span style={styles.objectiveBarText}>{campaign.objective}</span>
        </div>
      )}

      {totalResponses === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyTitle}>No survey responses yet</div>
          <p style={styles.emptyBody}>
            Purchase intent, product perception, and open feedback appear here once consumers
            complete the survey after trying this campaign.
          </p>
        </div>
      ) : (
      <>
      <div style={styles.scoreRow}>
        <div style={styles.scoreCard}>
          {/* DL-114: show actual q2 question text under score card label */}
          <div style={styles.scoreLabel}>{q2Label}</div>
          <div style={styles.scoreValue}>{data.purchaseIntentScore}</div>
          <div style={styles.scoreMax}>/100 score</div>
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

      {/* Reference Product Benchmark, Insights/Segmentation (2026-09-02):
          purchase intent and demographics were always two separate
          screens/sections — this is the first place the product shows
          whether intent actually differs across the sample's own
          segments (Sampl: "purchase intent can be viewed by audience
          segment"; Zamplit: "insights include...audience differences").
          Respondent count always shown alongside the percentage — same
          small-sample honesty this product already applies everywhere
          else; a segment with e.g. 1 respondent reads as exactly that,
          not a confident 100%/0% claim. */}
      {(data.purchaseIntentBySegment.byGender.length > 0 ||
        data.purchaseIntentBySegment.byAgeRange.length > 0) && (
        <div style={{ ...styles.grid, marginTop: 16 }}>
          <SegmentIntentCard title="Purchase Intent by Gender" segments={data.purchaseIntentBySegment.byGender} />
          <SegmentIntentCard title="Purchase Intent by Age" segments={data.purchaseIntentBySegment.byAgeRange} />
        </div>
      )}

      <div style={{ ...styles.grid, marginTop: 16 }}>
        {/* DL-114: cardTitle now shows actual campaign question text (q1Label)
            resolved from campaign.surveyQuestions. Falls back to "First Impression"
            when campaign is not yet loaded — same display as pre-DL-114. */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>{q1Label}</div>
          {data.firstImpressionScore.responseCount === 0 ? (
            <p style={styles.empty}>No responses to this question yet.</p>
          ) : (
            <div style={styles.scoreCard}>
              <div style={styles.scoreValue}>{data.firstImpressionScore.average}</div>
              <div style={styles.scoreMax}>/ 5 average · {data.firstImpressionScore.responseCount} responses</div>
            </div>
          )}
        </div>

        {/* DL-114: actual q4 question text from campaign.surveyQuestions */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>{q4Label}</div>
          {comparisonData.length === 0 ? (
            <p style={styles.empty}>No responses to this question yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={comparisonData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#3d4a6a' }}
                  axisLine={{ stroke: '#1a2540' }}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: '#3d4a6a' }} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {comparisonData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={{ ...styles.grid, marginTop: 16 }}>
        {/* DL-114: actual q3 question text */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>{q3Label}</div>
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

        {/* DL-114: actual q5 question text */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>{q5Label}</div>
          {data.verbatims.length === 0 ? (
            <div style={styles.emptyWrap}>
              <p style={styles.empty}>No open-ended responses yet.</p>
              <p style={styles.emptyHint}>
                Consumer verbatims appear here as respondents answer this question.
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

      {data.customQuestions.length > 0 && (
        <div style={styles.customSection}>
          <div style={styles.customSectionLabel}>Campaign-Specific Questions</div>
          <div style={styles.grid}>
            {data.customQuestions.map((q) => (
              <div key={q.id} style={styles.card}>
                <div style={styles.cardTitle}>{q.text}</div>
                {q.responseCount === 0 ? (
                  <p style={styles.empty}>No responses to this question yet.</p>
                ) : q.type === 'multiple_choice' && q.breakdown ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={q.breakdown} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: '#3d4a6a' }}
                        axisLine={{ stroke: '#1a2540' }}
                        tickLine={false}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#3d4a6a' }} axisLine={false} tickLine={false} />
                      <Tooltip {...CHART_TOOLTIP} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {q.breakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : q.average !== undefined ? (
                  <div style={styles.scoreCard}>
                    <div style={styles.scoreValue}>{q.average}</div>
                    <div style={styles.scoreMax}>/ 5 average · {q.responseCount} responses</div>
                  </div>
                ) : q.verbatims && q.verbatims.length > 0 ? (
                  <div style={styles.verbatims}>
                    {q.verbatims.map((v, i) => (
                      <div key={i} style={styles.verbatim}>
                        <span style={styles.quoteChar}>"</span>
                        {v}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={styles.empty}>No open-ended responses meet the display threshold yet.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}

function SegmentIntentCard({
  title,
  segments,
}: {
  title: string;
  segments: { label: string; respondentCount: number; positiveIntentPercent: number }[];
}) {
  if (segments.length === 0) return null;
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      {segments.map((seg) => (
        <div key={seg.label} style={styles.intentRow}>
          <span style={styles.segmentLabel}>
            {seg.label} <span style={styles.segmentCount}>({seg.respondentCount})</span>
          </span>
          <div style={styles.barTrack}>
            <div style={{ ...styles.barFill, width: `${seg.positiveIntentPercent}%`, background: '#b2f24d' }} />
          </div>
          <span style={{ ...styles.intentPct, color: '#b2f24d' }}>{seg.positiveIntentPercent}%</span>
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: { color: '#7a8bab', fontSize: 14, marginTop: 32 },
  error: { color: '#dc2626', fontSize: 14, marginTop: 32 },
  header: { marginBottom: 16 },
  // DL-114: campaign research objective shown between page header and first data card
  objectiveBar: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 10,
    background: '#f7fff0',
    border: '1px solid #d4f09a',
    borderLeft: '3px solid #b2f24d',
    borderRadius: '0 8px 8px 0',
    padding: '10px 16px',
    marginBottom: 20,
    flexWrap: 'wrap' as const,
  },
  objectiveBarLabel: {
    fontSize: 9,
    fontWeight: 800,
    color: '#3a6b00',
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    flexShrink: 0,
  },
  objectiveBarText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1a3a00',
    fontStyle: 'italic' as const,
    lineHeight: 1.4,
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
  scoreRow: {
    display: 'flex',
    gap: 20,
    marginBottom: 20,
    alignItems: 'stretch',
  },
  scoreCard: {
    background: '#ffffff',
    border: '1px solid #e8ecf3',
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
    color: '#7a8bab',
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
  scoreMax: { fontSize: 16, color: '#7a8bab', fontWeight: 600, marginTop: 4 },
  intentBars: {
    flex: 1,
    background: '#ffffff',
    border: '1px solid #e8ecf3',
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
    color: '#7a8bab',
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    marginBottom: 4,
  },
  intentRow: { display: 'flex', alignItems: 'center', gap: 12 },
  intentLabel: { width: 90, fontSize: 12, color: '#4a5a7e', fontWeight: 500 },
  segmentLabel: { width: 130, fontSize: 12, color: '#4a5a7e', fontWeight: 500, textTransform: 'capitalize' as const },
  segmentCount: { color: '#7c8eb8', fontWeight: 400 },
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
  customSection: { marginTop: 20 },
  customSectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#7a8bab',
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: 'uppercase' as const,
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e8ecf3',
    borderRadius: 14,
    padding: 24,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#7a8bab',
    letterSpacing: 1.5,
    marginBottom: 16,
    textTransform: 'uppercase' as const,
  },
  emptyWrap: { paddingTop: 8 },
  empty: { color: '#7a8bab', fontSize: 13, margin: '0 0 8px' },
  emptyHint: { color: '#94a3b8', fontSize: 11, margin: 0, lineHeight: 1.5 },
  verbatims: { display: 'flex', flexDirection: 'column', gap: 10 },
  verbatim: {
    background: '#f7f8fb',
    borderLeft: '2px solid #b2f24d',
    padding: '10px 14px',
    borderRadius: '0 8px 8px 0',
    fontSize: 13,
    color: '#4a5a7e',
    lineHeight: 1.6,
  },
  quoteChar: { color: '#b2f24d', fontWeight: 700, marginRight: 4 },
};

import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminCampaignsApi } from '../../api/adminEndpoints';
import type {
  AdminCampaign,
  OverviewData,
  DemographicsData,
  SurveyData,
  Participant,
  AiReport,
} from '../../api/types';

type Tab = 'overview' | 'participants' | 'insights' | 'report';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'participants', label: 'Participants' },
  { id: 'insights', label: 'Insights & Survey' },
  { id: 'report', label: 'AI Report' },
];

// Founder ruling W-2 (2026-09-02): "Selected Campaign -> Participants/
// Data -> Insights -> Report" — the final step of the required Admin
// navigation. Reuses the exact same AnalyticsService/ReportService data
// the Company Console's own pages already render (via the admin-gated
// proxy endpoints) — this is a genuinely operational cross-Company view,
// not a mockup.
export default function AdminCampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>('overview');
  const [campaign, setCampaign] = useState<AdminCampaign | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [demographics, setDemographics] = useState<DemographicsData | null>(null);
  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantsTotal, setParticipantsTotal] = useState(0);
  const [participantsPage, setParticipantsPage] = useState(1);
  const [aiReport, setAiReport] = useState<AiReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState('');

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    Promise.all([
      adminCampaignsApi.get(id),
      adminCampaignsApi.getOverview(id),
      adminCampaignsApi.getDemographics(id),
      adminCampaignsApi.getSurvey(id),
      adminCampaignsApi.getParticipants(id, 1),
    ])
      .then(([camp, ov, demo, surv, parts]) => {
        setCampaign(camp);
        setOverview(ov);
        setDemographics(demo);
        setSurvey(surv);
        setParticipants(parts.participants);
        setParticipantsTotal(parts.total);
      })
      .catch(() => setError('Failed to load campaign.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(load, [load]);

  useEffect(() => {
    if (tab === 'report' && id && !aiReport) {
      adminCampaignsApi.getAiSummary(id).then(setAiReport).catch(() => undefined);
    }
  }, [tab, id, aiReport]);

  // Product Reference Alignment (2026-09-02): real operational control —
  // same lifecycle model and confirm-before-ending pattern
  // CampaignDetail.tsx (Company Console) already uses; no new state
  // machine, just an authorized operator exercising the same transition.
  const LIFECYCLE_ENDING_STATUSES = ['completed', 'archived'];
  const handleStatusChange = (newStatus: string) => {
    if (!id || !campaign || newStatus === campaign.status) return;
    if (
      LIFECYCLE_ENDING_STATUSES.includes(newStatus) &&
      !window.confirm(
        `Set this campaign to ${newStatus.toUpperCase()}? It will stop appearing as an active trial to consumers. This can be changed back later.`,
      )
    ) {
      return;
    }
    setStatusSaving(true);
    setStatusError('');
    adminCampaignsApi
      .update(id, { status: newStatus })
      .then((updated) => setCampaign((prev) => (prev ? { ...prev, status: updated.status } : prev)))
      .catch(() => setStatusError('Could not change status.'))
      .finally(() => setStatusSaving(false));
  };

  const loadParticipantsPage = (page: number) => {
    if (!id) return;
    adminCampaignsApi.getParticipants(id, page).then((res) => {
      setParticipants(res.participants);
      setParticipantsTotal(res.total);
      setParticipantsPage(page);
    });
  };

  if (loading) return <div style={styles.muted}>Loading campaign…</div>;
  if (error) return <div style={styles.errMsg}>{error}</div>;
  if (!campaign) return null;

  return (
    <div style={styles.root}>
      <Link
        to={campaign.brandAccountId ? `/admin/companies/${campaign.brandAccountId}` : '/admin/campaigns'}
        style={styles.backLink}
      >
        ← {campaign.companyName ?? 'Campaigns'}
      </Link>

      <div style={styles.headerRow}>
        <div style={styles.header}>
          <h1 style={styles.title}>{campaign.productName}</h1>
          <p style={styles.sub}>
            {campaign.companyName ?? 'No Company'}
            {campaign.locationName ? ` · ${campaign.locationName}` : ''}
          </p>
        </div>
        <div style={styles.statusControl}>
          <span style={styles.statusControlLabel}>Status</span>
          <select
            style={styles.statusSelect}
            value={campaign.status}
            disabled={statusSaving}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {['draft', 'active', 'paused', 'completed', 'archived'].map((s) => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>
      {statusError && <p style={styles.statusErrorText}>{statusError}</p>}

      <div style={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.id}
            style={{ ...styles.tabBtn, ...(tab === t.id ? styles.tabBtnActive : {}) }}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && overview && (
        <div style={styles.statsGrid}>
          <StatCard label="Redemptions" value={overview.totalRedemptions} />
          <StatCard label="Survey Completions" value={overview.surveyCompletions} />
          <StatCard label="Completion Rate" value={`${overview.completionRate}%`} />
          <StatCard label="Purchase Intent" value={`${overview.purchaseIntentPercent}%`} />
        </div>
      )}

      {tab === 'participants' && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Participants ({participantsTotal})</div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Age</th>
                  <th style={styles.th}>Gender</th>
                  <th style={styles.th}>City</th>
                  <th style={styles.th}>Redeemed</th>
                  <th style={styles.th}>Survey</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.id}>
                    <td style={styles.td}>{p.ageRange ?? '—'}</td>
                    <td style={styles.td}>{p.gender ?? '—'}</td>
                    <td style={styles.td}>{p.city ?? '—'}</td>
                    <td style={styles.td}>{new Date(p.redeemedAt).toLocaleString()}</td>
                    <td style={styles.td}>{p.hasSurvey ? '✓' : '—'}</td>
                  </tr>
                ))}
                {participants.length === 0 && (
                  <tr><td style={styles.td} colSpan={5}>No participants yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={styles.pagination}>
            <button style={styles.pageBtn} disabled={participantsPage <= 1} onClick={() => loadParticipantsPage(participantsPage - 1)}>← Prev</button>
            <span style={styles.pageLabel}>Page {participantsPage} of {Math.max(1, Math.ceil(participantsTotal / 20))}</span>
            <button style={styles.pageBtn} disabled={participantsPage * 20 >= participantsTotal} onClick={() => loadParticipantsPage(participantsPage + 1)}>Next →</button>
          </div>
        </div>
      )}

      {tab === 'insights' && demographics && survey && (
        <>
          <div style={styles.grid2}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Demographics</div>
              <DistributionList title="Age" items={demographics.ageDistribution} />
              <DistributionList title="Gender" items={demographics.genderDistribution} />
              <DistributionList title="City" items={demographics.cityDistribution} />
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Survey — Purchase Intent {survey.purchaseIntentScore}%</div>
              <DistributionList title="Purchase Intent" items={survey.purchaseIntentDistribution} />
            </div>
          </div>

          {/* Product Completion Wave (2026-09-02): the full survey result —
              not just Purchase Intent/Demographics. Q1/Q3/Q4 are part of
              every campaign's default 5-question survey (same data
              SurveyResults.tsx on the Company Console now also shows);
              customQuestions are whatever a Company added beyond the
              core 5 via Survey Builder V2. All read from the same
              GET /admin/campaigns/:id/survey response already fetched —
              no new endpoint. */}
          <div style={{ ...styles.grid2, marginTop: 14 }}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>First Impression (Q1)</div>
              {survey.firstImpressionScore.responseCount === 0 ? (
                <p style={styles.hint}>No responses to this question yet.</p>
              ) : (
                <p style={styles.narrative}>
                  <strong>{survey.firstImpressionScore.average} / 5</strong> average ·{' '}
                  {survey.firstImpressionScore.responseCount} responses
                </p>
              )}
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Product Descriptor (Q3)</div>
              <DistributionListRaw items={survey.questionBreakdown['q3'] ?? []} />
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Compared to Similar Products (Q4)</div>
              <DistributionListRaw items={survey.questionBreakdown['q4'] ?? []} />
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Open Feedback (Q5)</div>
              {survey.verbatims.length === 0 ? (
                <p style={styles.hint}>No open-ended responses yet.</p>
              ) : (
                survey.verbatims.map((v, i) => (
                  <p key={i} style={styles.verbatim}>&ldquo;{v}&rdquo;</p>
                ))
              )}
            </div>
          </div>

          {survey.customQuestions.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={styles.subheading}>Campaign-Specific Questions</div>
              <div style={styles.grid2}>
                {survey.customQuestions.map((q) => (
                  <div key={q.id} style={styles.card}>
                    <div style={styles.cardTitle}>{q.text}</div>
                    {q.responseCount === 0 ? (
                      <p style={styles.hint}>No responses to this question yet.</p>
                    ) : q.breakdown ? (
                      <DistributionListRaw items={q.breakdown} />
                    ) : q.average !== undefined ? (
                      <p style={styles.narrative}>
                        <strong>{q.average} / 5</strong> average · {q.responseCount} responses
                      </p>
                    ) : q.verbatims && q.verbatims.length > 0 ? (
                      q.verbatims.map((v, i) => (
                        <p key={i} style={styles.verbatim}>&ldquo;{v}&rdquo;</p>
                      ))
                    ) : (
                      <p style={styles.hint}>No responses meet the display threshold yet.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'report' && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>AI Insights Narrative</div>
          {!aiReport && <p style={styles.hint}>Loading…</p>}
          {aiReport && (
            <>
              <p style={styles.narrative}>{aiReport.narrative}</p>
              <p style={styles.hint}>Based on {aiReport.responseCountAtGeneration} survey response(s).</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

function DistributionList({ title, items }: { title: string; items: { label: string; count: number; percentage: number }[] }) {
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={styles.subheading}>{title}</div>
      {items.map((it) => (
        <div key={it.label} style={styles.distRow}>
          <span style={styles.distLabel}>{it.label}</span>
          <span style={styles.distValue}>{it.count} ({it.percentage}%)</span>
        </div>
      ))}
    </div>
  );
}

// Product Completion Wave (2026-09-02): a percentage-free counterpart to
// DistributionList — SurveyData.questionBreakdown/CustomQuestionResult.
// breakdown return {label,count}[] only (no precomputed percentage, since
// analytics.service.ts never needed one there before now); this computes
// it client-side from the same counts rather than changing that API shape.
function DistributionListRaw({ items }: { items: { label: string; count: number }[] }) {
  if (items.length === 0) return <p style={styles.hint}>No responses to this question yet.</p>;
  const total = items.reduce((sum, it) => sum + it.count, 0) || 1;
  return (
    <div>
      {items.map((it) => (
        <div key={it.label} style={styles.distRow}>
          <span style={styles.distLabel}>{it.label}</span>
          <span style={styles.distValue}>{it.count} ({Math.round((it.count / total) * 100)}%)</span>
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { maxWidth: 960 },
  muted: { color: '#7a8bab', fontSize: 14 },
  errMsg: { color: '#dc2626', fontSize: 14 },
  backLink: { fontSize: 12, color: '#7a8bab', textDecoration: 'none', fontWeight: 600 },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '16px 0 4px' },
  header: {},
  statusControl: { display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: 4 },
  statusControlLabel: { fontSize: 10, fontWeight: 800, color: '#7a8bab', letterSpacing: 0.5, textTransform: 'uppercase' as const },
  statusSelect: {
    background: '#ffffff', border: '1px solid #e8ecf3', borderRadius: 8, padding: '8px 12px',
    fontSize: 12, fontWeight: 700, color: '#0a1120', outline: 'none', cursor: 'pointer',
  },
  statusErrorText: { fontSize: 12, color: '#dc2626', margin: '0 0 12px' },
  title: { fontSize: 22, fontWeight: 800, color: '#0a1120', margin: '0 0 4px', letterSpacing: -0.3 },
  sub: { fontSize: 12, color: '#7a8bab', margin: 0 },
  tabs: { display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #e8ecf3' },
  tabBtn: {
    background: 'transparent', border: 'none', borderBottom: '2px solid transparent', color: '#7a8bab',
    padding: '10px 4px', marginRight: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
  tabBtnActive: { color: '#0a1120', borderBottom: '2px solid #b2f24d' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 },
  statCard: { background: '#ffffff', border: '1px solid #e8ecf3', borderRadius: 14, padding: 20, textAlign: 'center' as const },
  statValue: { fontSize: 28, fontWeight: 900, color: '#0a1120' },
  statLabel: { fontSize: 11, color: '#7a8bab', fontWeight: 700, marginTop: 4, letterSpacing: 0.5 },
  card: { background: '#ffffff', border: '1px solid #e8ecf3', borderRadius: 16, padding: 24 },
  cardTitle: { fontSize: 14, fontWeight: 800, color: '#0a1120', marginBottom: 14 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  tableWrap: { overflow: 'auto', marginBottom: 12 },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: {
    textAlign: 'left' as const, fontSize: 10, fontWeight: 800, color: '#7a8bab', letterSpacing: 0.5,
    padding: '10px 12px', borderBottom: '1px solid #e8ecf3', textTransform: 'uppercase' as const,
  },
  td: { padding: '10px 12px', fontSize: 12, color: '#0a1120', borderBottom: '1px solid #f1f4f9' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 },
  pageBtn: {
    background: '#ffffff', border: '1px solid #e8ecf3', color: '#0a1120', borderRadius: 8,
    padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
  },
  pageLabel: { fontSize: 12, color: '#7a8bab', fontWeight: 600 },
  subheading: { fontSize: 11, fontWeight: 800, color: '#7a8bab', letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' as const },
  distRow: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#374151', padding: '4px 0' },
  distLabel: { fontWeight: 600 },
  distValue: { color: '#7a8bab' },
  verbatim: { fontSize: 12, color: '#374151', fontStyle: 'italic' as const, margin: '4px 0' },
  narrative: { fontSize: 13, color: '#0a1120', lineHeight: 1.7 },
  hint: { fontSize: 12, color: '#a8b3c9' },
};

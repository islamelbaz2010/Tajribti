import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { analyticsApi, campaignApi } from '../api/endpoints';
import type { OverviewData, Campaign, LiveFeedEntry } from '../api/types';

// Product Transformation (2026-09-01): Campaign Management (`/campaigns`)
// is now the canonical place to see/switch between every campaign on the
// account, with status, image, and manage actions — so this section no
// longer duplicates that list, it just points to it. `otherCampaigns` is
// still fetched to decide whether the link is worth showing at all.
function OtherCampaignsLink({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <div style={historyStyles.section}>
      <div>
        <div style={historyStyles.title}>
          {count} other campaign{count === 1 ? '' : 's'} on this account
        </div>
        <p style={historyStyles.sub}>Switch campaigns, or manage all of them, from Campaigns</p>
      </div>
      <Link to="/campaigns" style={historyStyles.link}>
        View all campaigns →
      </Link>
    </div>
  );
}

const historyStyles: Record<string, React.CSSProperties> = {
  section: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 16,
    padding: '18px 24px',
    marginTop: 20,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap' as const,
  },
  title: { fontSize: 13, fontWeight: 700, color: '#edf0ff', margin: '0 0 2px', letterSpacing: 0.3 },
  sub: { fontSize: 11, color: '#2e3d5e', margin: 0 },
  link: {
    fontSize: 12,
    fontWeight: 700,
    color: '#b2f24d',
    textDecoration: 'none',
    flexShrink: 0,
  },
};

const POLL_INTERVAL = 3000;

function SignalFlowStrip() {
  const steps = [
    { label: 'TRIAL', sub: 'product handed to consumer' },
    { label: 'SIGNAL', sub: 'QR scan + survey' },
    { label: 'INTELLIGENCE', sub: 'structured data' },
    { label: 'DECISION', sub: 'brand action' },
  ];
  return (
    <div style={stripStyles.wrap}>
      {steps.map((step, i) => (
        <React.Fragment key={step.label}>
          <div style={stripStyles.step}>
            <div style={stripStyles.stepLabel}>{step.label}</div>
            <div style={stripStyles.stepSub}>{step.sub}</div>
          </div>
          {i < steps.length - 1 && <div style={stripStyles.arrow}>→</div>}
        </React.Fragment>
      ))}
    </div>
  );
}

const stripStyles: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 24px',
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 10,
    marginBottom: 24,
    overflowX: 'auto',
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    minWidth: 88,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: 800,
    color: '#b2f24d',
    letterSpacing: 1.5,
  },
  stepSub: {
    fontSize: 10,
    color: '#2e3d5e',
    textAlign: 'center' as const,
    lineHeight: 1.3,
  },
  arrow: {
    color: '#1a2540',
    fontSize: 16,
    fontWeight: 700,
    flexShrink: 0,
    marginBottom: 10,
  },
};

function SignalHero({ count, pulse }: { count: number; pulse: boolean }) {
  return (
    <div style={heroStyles.wrap}>
      <div style={heroStyles.headerRow}>
        <span style={heroStyles.sectionLabel}>CONSUMER SIGNALS</span>
      </div>
      <div style={heroStyles.countWrap}>
        {pulse && (
          <>
            <div style={heroStyles.ring1} />
            <div style={heroStyles.ring2} />
          </>
        )}
        <div style={heroStyles.countInner}>
          <span style={heroStyles.dot}>●</span>
          <span style={{ ...heroStyles.count, ...(pulse ? heroStyles.countPulse : {}) }}>
            {count}
          </span>
          <span style={heroStyles.dot}>●</span>
        </div>
      </div>
      <div style={heroStyles.sub}>consumer experiences captured</div>
    </div>
  );
}

const heroStyles: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '44px 24px 36px',
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 16,
    marginBottom: 20,
    position: 'relative' as const,
    overflow: 'hidden',
  },
  headerRow: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 3,
    color: '#2e3d5e',
  },
  countWrap: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 260,
    height: 130,
    marginBottom: 16,
  },
  ring1: {
    position: 'absolute' as const,
    width: 160,
    height: 160,
    borderRadius: '50%',
    border: '2px solid rgba(178, 242, 77, 0.35)',
    top: '50%',
    left: '50%',
    marginTop: -80,
    marginLeft: -80,
    animation: 'signalRing 1.1s ease-out forwards',
  },
  ring2: {
    position: 'absolute' as const,
    width: 160,
    height: 160,
    borderRadius: '50%',
    border: '1px solid rgba(178, 242, 77, 0.18)',
    top: '50%',
    left: '50%',
    marginTop: -80,
    marginLeft: -80,
    animation: 'signalRingDelay 1.1s ease-out 0.25s forwards',
  },
  countInner: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    position: 'relative' as const,
    zIndex: 1,
  },
  count: {
    fontSize: 100,
    fontWeight: 900,
    color: '#edf0ff',
    lineHeight: 1,
    letterSpacing: -3,
    transition: 'transform 0.25s ease',
  },
  countPulse: {
    transform: 'scale(1.05)',
  },
  dot: {
    fontSize: 14,
    color: '#b2f24d',
    lineHeight: 1,
    paddingBottom: 8,
  },
  sub: {
    fontSize: 12,
    color: '#2e3d5e',
    fontWeight: 500,
    letterSpacing: 0.5,
  },
};

function MetricCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div style={{ ...metricStyles.card, ...(accent ? metricStyles.cardAccent : {}) }}>
      <span style={{ ...metricStyles.value, ...(accent ? metricStyles.valueAccent : {}) }}>
        {value}
      </span>
      <span style={metricStyles.label}>{label}</span>
    </div>
  );
}

const metricStyles: Record<string, React.CSSProperties> = {
  card: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 12,
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  cardAccent: {
    borderColor: 'rgba(178, 242, 77, 0.2)',
  },
  value: {
    fontSize: 34,
    fontWeight: 800,
    color: '#edf0ff',
    lineHeight: 1,
  },
  valueAccent: {
    color: '#b2f24d',
  },
  label: {
    fontSize: 11,
    color: '#2e3d5e',
    fontWeight: 500,
    letterSpacing: 0.3,
  },
};

function FeedRow({ entry }: { entry: LiveFeedEntry }) {
  const time = new Date(entry.redeemedAt).toLocaleTimeString('en-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const tags = [entry.gender, entry.ageRange, entry.city].filter(Boolean) as string[];
  return (
    <div style={feedStyles.row}>
      <div style={feedStyles.dot} />
      <div style={feedStyles.tags}>
        {tags.length > 0
          ? tags.map((t, i) => <span key={i} style={feedStyles.tag}>{t}</span>)
          : <span style={feedStyles.anon}>Anonymous</span>}
      </div>
      <span style={feedStyles.time}>{time}</span>
    </div>
  );
}

const feedStyles: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 6,
    border: '1px solid #0e1a2e',
    marginBottom: 4,
    background: '#070c1a',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#b2f24d',
    flexShrink: 0,
  },
  tags: {
    flex: 1,
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap' as const,
  },
  tag: {
    fontSize: 11,
    color: '#6b7fa8',
    background: '#0e1a2e',
    borderRadius: 4,
    padding: '2px 8px',
    fontWeight: 500,
  },
  anon: { fontSize: 12, color: '#2e3d5e' },
  time: { fontSize: 11, color: '#2e3d5e', flexShrink: 0 },
};

export default function Overview() {
  const location = useLocation();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [otherCampaigns, setOtherCampaigns] = useState<Campaign[]>([]);
  const [data, setData] = useState<OverviewData | null>(null);
  const [pulse, setPulse] = useState(false);
  const [noCampaigns, setNoCampaigns] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Re-resolves whenever ?campaignId= changes (e.g. clicking an "Other
    // Campaigns" link) — the route itself doesn't remount on a query-string
    // change alone, so this effect must depend on location.search directly.
    setData(null);
    setNoCampaigns(false);

    // Check for the zero-campaigns case explicitly first — getSelected()
    // (via getMyActiveCampaign) throws when the brand has no campaigns yet,
    // which would otherwise leave this page stuck on the loading state
    // forever with no path forward for a brand-new account.
    campaignApi
      .getMyCampaigns()
      .then((list) => {
        if (list.length === 0) {
          setNoCampaigns(true);
          return;
        }
        campaignApi.getSelected().then(setCampaign).catch(console.error);
      })
      .catch(console.error);
  }, [location.search]);

  useEffect(() => {
    if (!campaign) return;
    campaignApi
      .getMyCampaigns()
      .then((list) => setOtherCampaigns(list.filter((c) => c.id !== campaign.id)))
      .catch(() => {});
  }, [campaign]);

  useEffect(() => {
    if (!campaign) return;

    const fetchData = async () => {
      try {
        const result = await analyticsApi.getOverview(campaign.id);
        setData((prev) => {
          if (prev && result.totalRedemptions !== prev.totalRedemptions) {
            setPulse(true);
            setTimeout(() => setPulse(false), 1200);
          }
          return result;
        });
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
    intervalRef.current = setInterval(fetchData, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [campaign]);

  if (noCampaigns) {
    return (
      <div style={styles.emptyState}>
        <h1 style={styles.emptyTitle}>No campaigns yet</h1>
        <p style={styles.emptySub}>
          This account has no campaigns yet. Create the first one to start collecting trial
          signals.
        </p>
        <Link to="/campaigns/new" style={styles.emptyBtn}>
          + New Campaign
        </Link>
      </div>
    );
  }

  if (!data || !campaign) {
    return <div style={styles.loading}>Connecting to signal stream…</div>;
  }

  return (
    <div>
      {/* Campaign Identity */}
      <div style={styles.campaignHeader}>
        <div style={styles.headerLeft}>
          {campaign.isDemo && <span style={styles.demoBadge}>DEMO CAMPAIGN</span>}
          <h1 style={styles.brandName}>{campaign.brandName}</h1>
          <p style={styles.campaignSub}>
            {campaign.productName}
            <span style={styles.sep}>·</span>
            {campaign.locationName}
          </p>
        </div>
        <div style={styles.liveBadge}>
          <div style={styles.liveDot} />
          LIVE
        </div>
      </div>

      {/* Trial → Signal → Intelligence → Decision */}
      <SignalFlowStrip />

      {/* Consumer Signals Hero */}
      <SignalHero count={data.totalRedemptions} pulse={pulse} />

      {/* Metric Cards */}
      <div style={styles.metricsGrid}>
        <MetricCard label="Survey Completions" value={data.surveyCompletions} />
        <MetricCard label="Completion Rate" value={`${data.completionRate}%`} />
        <MetricCard label="Purchase Intent" value={`${data.purchaseIntentPercent}%`} accent />
      </div>

      {/* Recent Activity */}
      <div style={styles.feedSection}>
        <div style={styles.feedHeader}>
          <h2 style={styles.feedTitle}>Recent Activity</h2>
          <p style={styles.feedSub}>Latest consumers who tried this campaign</p>
        </div>
        {data.liveFeed.length === 0 ? (
          <p style={styles.empty}>
            No activity yet. Share this campaign&rsquo;s QR code to get your first participant.
          </p>
        ) : (
          data.liveFeed.map((entry) => <FeedRow key={entry.id} entry={entry} />)
        )}
      </div>

      <OtherCampaignsLink count={otherCampaigns.length} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: { color: '#2e3d5e', fontSize: 16, marginTop: 40 },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center' as const,
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 16,
    padding: '64px 32px',
    marginTop: 40,
  },
  emptyTitle: { fontSize: 20, fontWeight: 800, color: '#edf0ff', margin: '0 0 8px' },
  emptySub: { fontSize: 13, color: '#6b7fa8', margin: '0 0 24px', maxWidth: 420, lineHeight: 1.5 },
  emptyBtn: {
    background: '#b2f24d',
    color: '#040812',
    textDecoration: 'none',
    borderRadius: 8,
    padding: '12px 24px',
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 0.3,
  },
  campaignHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  demoBadge: {
    display: 'inline-block',
    alignSelf: 'flex-start',
    fontSize: 9,
    fontWeight: 800,
    color: '#040812',
    background: '#b2f24d',
    borderRadius: 3,
    padding: '3px 8px',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  brandName: {
    fontSize: 28,
    fontWeight: 800,
    color: '#edf0ff',
    margin: 0,
    letterSpacing: -0.5,
  },
  campaignSub: {
    fontSize: 13,
    color: '#2e3d5e',
    margin: 0,
  },
  sep: {
    margin: '0 6px',
    color: '#1a2540',
  },
  liveBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(178, 242, 77, 0.08)',
    border: '1px solid rgba(178, 242, 77, 0.2)',
    color: '#b2f24d',
    borderRadius: 20,
    padding: '6px 14px',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#b2f24d',
    animation: 'pulse 1.5s infinite',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    marginBottom: 20,
  },
  feedSection: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 16,
    padding: 24,
  },
  feedHeader: {
    marginBottom: 14,
  },
  feedTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#edf0ff',
    margin: '0 0 2px',
    letterSpacing: 0.3,
  },
  feedSub: {
    fontSize: 11,
    color: '#2e3d5e',
    margin: 0,
  },
  empty: {
    color: '#2e3d5e',
    fontSize: 13,
    textAlign: 'center' as const,
    padding: '24px 0',
    margin: 0,
  },
};

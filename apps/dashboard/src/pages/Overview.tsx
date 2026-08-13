import React, { useEffect, useState, useRef } from 'react';
import { analyticsApi, campaignApi } from '../api/endpoints';
import type { OverviewData, Campaign, LiveFeedEntry } from '../api/types';

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
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [data, setData] = useState<OverviewData | null>(null);
  const [pulse, setPulse] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    campaignApi.getMyActiveCampaign().then(setCampaign).catch(console.error);
  }, []);

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

  if (!data || !campaign) {
    return <div style={styles.loading}>Connecting to signal stream…</div>;
  }

  return (
    <div>
      {/* Campaign Identity */}
      <div style={styles.campaignHeader}>
        <div style={styles.headerLeft}>
          <span style={styles.demoBadge}>DEMO CAMPAIGN</span>
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

      {/* Signal Stream */}
      <div style={styles.feedSection}>
        <div style={styles.feedHeader}>
          <h2 style={styles.feedTitle}>Signal Stream</h2>
          <p style={styles.feedSub}>Last 10 consumer signals · updates every 3 seconds</p>
        </div>
        {data.liveFeed.length === 0 ? (
          <p style={styles.empty}>
            No signals yet. Scan the Trial QR to generate your first consumer signal.
          </p>
        ) : (
          data.liveFeed.map((entry) => <FeedRow key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: { color: '#2e3d5e', fontSize: 16, marginTop: 40 },
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

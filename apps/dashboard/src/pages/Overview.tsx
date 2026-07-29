import React, { useEffect, useState, useRef } from 'react';
import { analyticsApi, campaignApi } from '../api/endpoints';
import type { OverviewData, Campaign, LiveFeedEntry } from '../api/types';

const POLL_INTERVAL = 3000;

function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div style={{ ...styles.statCard, ...(highlight ? styles.statCardHighlight : {}) }}>
      <span style={styles.statValue}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

function FeedRow({ entry }: { entry: LiveFeedEntry }) {
  const time = new Date(entry.redeemedAt).toLocaleTimeString('en-EG', { hour: '2-digit', minute: '2-digit' });
  const parts = [entry.gender, entry.ageRange, entry.city].filter(Boolean).join(' · ');
  return (
    <div style={styles.feedRow}>
      <div style={styles.feedDot} />
      <span style={styles.feedParts}>{parts || 'Anonymous'}</span>
      <span style={styles.feedTime}>{time}</span>
    </div>
  );
}

export default function Overview() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [data, setData] = useState<OverviewData | null>(null);
  const [prevCount, setPrevCount] = useState<number | null>(null);
  const [pulse, setPulse] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    campaignApi.getDemoActive().then(setCampaign).catch(console.error);
  }, []);

  useEffect(() => {
    if (!campaign) return;

    const fetchData = async () => {
      try {
        const result = await analyticsApi.getOverview(campaign.id);
        setData((prev) => {
          if (prev && result.totalRedemptions !== prev.totalRedemptions) {
            setPulse(true);
            setTimeout(() => setPulse(false), 800);
          }
          setPrevCount(prev?.totalRedemptions ?? null);
          return result;
        });
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
    intervalRef.current = setInterval(fetchData, POLL_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [campaign]);

  if (!data || !campaign) {
    return <div style={styles.loading}>Connecting to live feed…</div>;
  }

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Live Overview</h1>
          <p style={styles.sub}>{campaign.productName} · {campaign.locationName}</p>
        </div>
        <div style={styles.liveBadge}>
          <div style={styles.liveDot} />
          LIVE
        </div>
      </div>

      <div style={styles.statsGrid}>
        <StatCard
          label="Total Redemptions"
          value={data.totalRedemptions}
          highlight={pulse}
        />
        <StatCard label="Survey Completions" value={data.surveyCompletions} />
        <StatCard label="Completion Rate" value={`${data.completionRate}%`} />
        <StatCard label="Purchase Intent" value={`${data.purchaseIntentPercent}%`} />
      </div>

      <div style={styles.feedSection}>
        <h2 style={styles.sectionTitle}>Live Feed</h2>
        <p style={styles.feedSubtitle}>Last 10 participants · updates every 3 seconds</p>
        <div style={styles.feedList}>
          {data.liveFeed.length === 0 ? (
            <p style={styles.empty}>No participants yet. Scan the QR code to begin.</p>
          ) : (
            data.liveFeed.map((entry) => <FeedRow key={entry.id} entry={entry} />)
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: { color: '#666', fontSize: 16, marginTop: 40 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 700, color: '#1a1a2e', margin: 0 },
  sub: { color: '#888', fontSize: 14, marginTop: 4 },
  liveBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#e94560',
    color: '#fff',
    borderRadius: 20,
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#fff',
    animation: 'pulse 1.5s infinite',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  statCardHighlight: {
    transform: 'scale(1.03)',
    boxShadow: '0 4px 20px rgba(233,69,96,0.25)',
    border: '2px solid #e94560',
  },
  statValue: { fontSize: 36, fontWeight: 800, color: '#1a1a2e' },
  statLabel: { fontSize: 13, color: '#888', fontWeight: 500 },
  feedSection: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: 0 },
  feedSubtitle: { color: '#aaa', fontSize: 12, marginTop: 4, marginBottom: 16 },
  feedList: { display: 'flex', flexDirection: 'column', gap: 4 },
  feedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    background: '#fafafa',
  },
  feedDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#e94560',
    flexShrink: 0,
  },
  feedParts: { fontSize: 14, color: '#333', flex: 1 },
  feedTime: { fontSize: 12, color: '#aaa' },
  empty: { color: '#aaa', fontSize: 14, textAlign: 'center', padding: '20px 0' },
};

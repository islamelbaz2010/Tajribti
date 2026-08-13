import React, { useEffect, useState } from 'react';
import { campaignApi, qrApi } from '../api/endpoints';
import type { Campaign } from '../api/types';

export default function CampaignDetail() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    campaignApi
      .getMyActiveCampaign()
      .then(async (c) => {
        setCampaign(c);
        const blob = await qrApi.getQrImage(c.id);
        setQrUrl(URL.createObjectURL(blob));
      })
      .catch(() => setError('Failed to load campaign. Is the backend running and seeded?'))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    if (!qrUrl || !campaign) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>QR — ${campaign.brandName}</title>
      <style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:'Helvetica Neue',sans-serif;background:#fff;}
      img{width:280px;height:280px;} h2{font-size:18px;margin:16px 0 4px;} p{font-size:13px;color:#666;margin:0;}</style>
      </head><body>
      <h2>${campaign.brandName} — ${campaign.productName}</h2>
      <p>${campaign.locationName ?? ''}</p>
      <img src="${qrUrl}" alt="QR Code" style="margin:20px 0;" />
      <p style="font-size:11px;color:#999;">Scan to participate · DEMO</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  if (loading) return <div style={styles.muted}>Loading campaign…</div>;
  if (error) return <div style={styles.errMsg}>{error}</div>;
  if (!campaign) return null;

  return (
    <div>
      <div style={styles.header}>
        <div>
          <span style={styles.demoBadge}>DEMO CAMPAIGN</span>
          <h1 style={styles.title}>Turn Trial Into Signal</h1>
          <p style={styles.sub}>Campaign details and QR activation code</p>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.infoCard}>
          <div style={styles.cardTitle}>Campaign Identity</div>
          <InfoRow label="Brand" value={campaign.brandName} accent />
          <InfoRow label="Product" value={campaign.productName} />
          <InfoRow label="Location" value={campaign.locationName} />
          <InfoRow label="Address" value={campaign.locationAddress} />
          <InfoRow label="Status" value={campaign.status.toUpperCase() + ' · DEMO'} highlight />
          <InfoRow label="Target" value={`${campaign.targetCount} participants`} />
          <InfoRow label="Reward" value={`${campaign.rewardPoints} points`} />
          <InfoRow label="Period" value={`${campaign.startDate} → ${campaign.endDate}`} />
          {campaign.description && (
            <p style={styles.description}>{campaign.description}</p>
          )}

          <div style={styles.divider} />

          <div style={styles.cardTitle}>How It Works</div>
          {[
            ['TRIAL', 'Consumer receives product at activation point'],
            ['SIGNAL', 'Consumer scans QR → completes 5-question survey'],
            ['INTELLIGENCE', 'Platform structures data into insights'],
            ['DECISION', 'Brand acts on segment-level intelligence'],
          ].map(([label, desc]) => (
            <div key={label} style={styles.flowRow}>
              <div style={styles.flowLabel}>{label}</div>
              <div style={styles.flowDesc}>{desc}</div>
            </div>
          ))}
        </div>

        <div style={styles.qrCard}>
          <div style={styles.cardTitle}>Trial QR Code</div>
          <div style={styles.qrWrap}>
            {qrUrl ? (
              <img src={qrUrl} alt="Demo QR Code" style={styles.qrImg} />
            ) : (
              <div style={styles.qrPlaceholder}>Generating…</div>
            )}
          </div>
          <p style={styles.qrHint}>Demo QR resets after each scan — reusable in meetings</p>
          <button style={styles.printBtn} onClick={handlePrint} disabled={!qrUrl}>
            Print QR for Meeting
          </button>
          <div style={styles.qrInstructions}>
            {[
              'Open consumer app on demo phone',
              'Tap "Scan QR" and point at this code',
              'Complete 5-question survey (60 seconds)',
              'Watch Overview counter increment live',
            ].map((text, i) => (
              <div key={i} style={styles.instructionRow}>
                <span style={styles.instructionNum}>{i + 1}</span>
                <span style={styles.instructionText}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  accent,
  highlight,
}: {
  label: string;
  value: string;
  accent?: boolean;
  highlight?: boolean;
}) {
  return (
    <div style={infoStyles.row}>
      <span style={infoStyles.label}>{label}</span>
      <span
        style={{
          ...infoStyles.value,
          ...(accent ? infoStyles.accent : {}),
          ...(highlight ? infoStyles.highlight : {}),
        }}
      >
        {value}
      </span>
    </div>
  );
}

const infoStyles: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #0e1a2e',
  },
  label: { fontSize: 12, color: '#2e3d5e', fontWeight: 500 },
  value: { fontSize: 13, color: '#7c8eb8', fontWeight: 500, textAlign: 'right' as const },
  accent: { color: '#edf0ff', fontWeight: 700 },
  highlight: { color: '#b2f24d', fontWeight: 700, fontSize: 11, letterSpacing: 0.5 },
};

const styles: Record<string, React.CSSProperties> = {
  muted: { color: '#2e3d5e', fontSize: 14, marginTop: 32 },
  errMsg: { color: '#fb7185', fontSize: 14, marginTop: 32 },
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
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    color: '#edf0ff',
    margin: '4px 0 6px',
    letterSpacing: -0.3,
  },
  sub: { fontSize: 13, color: '#2e3d5e', margin: 0 },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: 20,
    alignItems: 'start',
  },
  infoCard: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 16,
    padding: 28,
  },
  qrCard: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 16,
    padding: 28,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#2e3d5e',
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: 'uppercase' as const,
  },
  description: {
    fontSize: 13,
    color: '#4a5a7e',
    lineHeight: 1.6,
    marginTop: 12,
    marginBottom: 0,
  },
  divider: { borderTop: '1px solid #111d35', margin: '20px 0 16px' },
  flowRow: {
    display: 'flex',
    gap: 16,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  flowLabel: {
    fontSize: 9,
    fontWeight: 800,
    color: '#b2f24d',
    letterSpacing: 1.5,
    minWidth: 88,
    paddingTop: 2,
  },
  flowDesc: { fontSize: 12, color: '#4a5a7e', lineHeight: 1.5 },
  qrWrap: {
    background: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    marginTop: 4,
  },
  qrImg: { width: 200, height: 200, display: 'block' },
  qrPlaceholder: {
    width: 200,
    height: 200,
    background: '#111d35',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#2e3d5e',
    fontSize: 12,
  },
  qrHint: {
    fontSize: 10,
    color: '#2e3d5e',
    margin: '0 0 16px',
    textAlign: 'center' as const,
  },
  printBtn: {
    background: 'transparent',
    border: '1px solid #1a2540',
    color: '#7c8eb8',
    borderRadius: 8,
    padding: '9px 18px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: 20,
    width: '100%',
  },
  qrInstructions: {
    width: '100%',
    borderTop: '1px solid #111d35',
    paddingTop: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  instructionRow: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  instructionNum: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#1a2540',
    color: '#7c8eb8',
    fontSize: 10,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  instructionText: { fontSize: 12, color: '#4a5a7e', lineHeight: 1.5 },
};

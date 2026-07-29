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
      .getDemoActive()
      .then(async (c) => {
        setCampaign(c);
        const blob = await qrApi.getQrImage(c.id);
        setQrUrl(URL.createObjectURL(blob));
      })
      .catch(() => setError('Failed to load campaign. Is the backend running and seeded?'))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    if (!qrUrl) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><body style="text-align:center;font-family:sans-serif;padding:40px">
        <h2>${campaign?.productName ?? 'Campaign'}</h2>
        <p>${campaign?.locationName ?? ''}</p>
        <img src="${qrUrl}" style="width:300px;height:300px" />
        <p style="font-size:12px;color:#888;margin-top:16px">Scan to try the product and give feedback</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  if (loading) return <div style={styles.loading}>Loading campaign…</div>;
  if (error) return <div style={styles.error}>{error}</div>;
  if (!campaign) return null;

  return (
    <div>
      <h1 style={styles.title}>Campaign & QR Code</h1>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Campaign Details</h2>
          <Row label="Product" value={campaign.productName} />
          <Row label="Brand" value={campaign.brandName} />
          <Row label="Location" value={campaign.locationName} />
          <Row label="Address" value={campaign.locationAddress} />
          <Row label="Status" value={campaign.status} />
          <Row label="Target" value={`${campaign.targetCount} participants`} />
          <Row label="Reward" value={`${campaign.rewardPoints} points`} />
          <Row label="Period" value={`${campaign.startDate} → ${campaign.endDate}`} />
          <p style={styles.description}>{campaign.description}</p>
        </div>

        <div style={styles.qrCard}>
          <h2 style={styles.cardTitle}>QR Code</h2>
          <p style={styles.qrSub}>Display or print for in-store use</p>
          {qrUrl ? (
            <img src={qrUrl} alt="Campaign QR Code" style={styles.qrImage} />
          ) : (
            <div style={styles.qrPlaceholder}>Generating…</div>
          )}
          <button style={styles.printBtn} onClick={handlePrint} disabled={!qrUrl}>
            Print QR Code
          </button>
          <p style={styles.qrHint}>Demo QR resets after each scan — reusable in meetings</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={styles.rowValue}>{value}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: { color: '#666', fontSize: 16, marginTop: 40 },
  error: { color: '#e94560', fontSize: 15, marginTop: 40 },
  title: { fontSize: 28, fontWeight: 700, color: '#1a1a2e', marginBottom: 24 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 28,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardTitle: { fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginTop: 0, marginBottom: 20 },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0',
    gap: 16,
  },
  rowLabel: { fontSize: 13, color: '#888', fontWeight: 500 },
  rowValue: { fontSize: 14, color: '#1a1a2e', fontWeight: 600, textAlign: 'right' },
  description: { color: '#555', fontSize: 14, lineHeight: 1.6, marginTop: 16, marginBottom: 0 },
  qrCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 28,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  qrSub: { color: '#aaa', fontSize: 13, marginBottom: 24 },
  qrImage: { width: 240, height: 240, borderRadius: 8 },
  qrPlaceholder: {
    width: 240,
    height: 240,
    background: '#f5f6fa',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#aaa',
  },
  printBtn: {
    marginTop: 20,
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  qrHint: { color: '#aaa', fontSize: 11, marginTop: 12, marginBottom: 0 },
};

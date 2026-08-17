import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useConsumerJourney } from './JoinLayout';

export default function JoinPage() {
  const { campaign, campaignId } = useConsumerJourney();
  const navigate = useNavigate();

  if (!campaign) return null;

  return (
    <div style={s.root}>
      {campaign.productImage && (
        <img
          src={campaign.productImage}
          alt={campaign.productName}
          style={s.hero}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      <div style={s.body}>
        <p style={s.brand}>{campaign.brandName}</p>
        <h1 style={s.product}>{campaign.productName}</h1>
        {campaign.locationName && (
          <p style={s.location}>📍 {campaign.locationName}</p>
        )}
        {campaign.description && (
          <p style={s.desc}>{campaign.description}</p>
        )}
        <div style={s.reward}>
          <span style={s.rewardNum}>{campaign.rewardPoints}</span>
          <span style={s.rewardLabel}>نقطة مكافأة</span>
        </div>
        <p style={s.steps}>
          جرّب المنتج → أجب على ٥ أسئلة → واحصل على نقاطك
        </p>
        <button style={s.btn} onClick={() => navigate(`/join/${campaignId}/phone`)}>
          ابدأ التجربة
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', flex: 1 },
  hero: { width: '100%', height: 220, objectFit: 'cover' },
  body: { padding: '24px 24px 40px', display: 'flex', flexDirection: 'column', gap: 8 },
  brand: { fontSize: 13, color: '#6b7280', margin: 0, fontFamily: 'sans-serif' },
  product: { fontSize: 26, fontWeight: 800, color: '#1a1a2e', margin: 0, fontFamily: 'sans-serif' },
  location: { fontSize: 13, color: '#6b7280', margin: '4px 0 0', fontFamily: 'sans-serif' },
  desc: { fontSize: 14, color: '#374151', lineHeight: 1.6, margin: '8px 0 0', fontFamily: 'sans-serif' },
  reward: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 10,
    padding: '12px 16px',
    marginTop: 16,
  },
  rewardNum: { fontSize: 28, fontWeight: 800, color: '#15803d', fontFamily: 'sans-serif' },
  rewardLabel: { fontSize: 14, color: '#15803d', fontFamily: 'sans-serif' },
  steps: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    margin: '8px 0 0',
    fontFamily: 'sans-serif',
  },
  btn: {
    marginTop: 20,
    background: '#1a1a2e',
    color: '#ffffff',
    border: 'none',
    borderRadius: 14,
    padding: '16px 24px',
    fontSize: 17,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'sans-serif',
    width: '100%',
  },
};

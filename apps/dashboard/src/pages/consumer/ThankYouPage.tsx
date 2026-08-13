import React from 'react';
import { useLocation } from 'react-router-dom';
import { useConsumerJourney } from './JoinLayout';

export default function ThankYouPage() {
  const { campaign } = useConsumerJourney();
  const location = useLocation();
  const points: number = (location.state as { points?: number })?.points ?? campaign?.rewardPoints ?? 0;

  return (
    <div style={s.root}>
      <div style={s.body}>
        <div style={s.icon}>✓</div>
        <h2 style={s.heading}>شكراً لمشاركتك!</h2>
        <p style={s.sub}>تم تسجيل تجربتك بنجاح</p>
        {points > 0 && (
          <div style={s.reward}>
            <span style={s.rewardNum}>{points}</span>
            <span style={s.rewardLabel}>نقطة مكافأة تمت إضافتها</span>
          </div>
        )}
        {campaign && (
          <p style={s.brand}>
            شكراً من {campaign.brandName}
          </p>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', flex: 1 },
  body: {
    padding: '60px 24px 40px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 12, flex: 1,
  },
  icon: {
    width: 72, height: 72, borderRadius: '50%',
    background: '#1a1a2e', color: '#ffffff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 36, fontWeight: 800, marginBottom: 8,
  },
  heading: { fontSize: 26, fontWeight: 800, color: '#1a1a2e', margin: 0, fontFamily: 'sans-serif', textAlign: 'center' as const },
  sub: { fontSize: 15, color: '#6b7280', margin: 0, fontFamily: 'sans-serif', textAlign: 'center' as const },
  reward: {
    display: 'flex', alignItems: 'baseline', gap: 6,
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    borderRadius: 12, padding: '16px 24px', marginTop: 12,
  },
  rewardNum: { fontSize: 32, fontWeight: 800, color: '#15803d', fontFamily: 'sans-serif' },
  rewardLabel: { fontSize: 15, color: '#15803d', fontFamily: 'sans-serif' },
  brand: { fontSize: 14, color: '#9ca3af', marginTop: 16, fontFamily: 'sans-serif', textAlign: 'center' as const },
};

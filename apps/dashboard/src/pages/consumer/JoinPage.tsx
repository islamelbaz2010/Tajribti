import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useConsumerJourney } from './JoinLayout';

// QR/Consumer content fix (2026-09-02): this line previously hardcoded
// "أجب على ٥ أسئلة" ("answer 5 questions") for every campaign regardless of
// its actual surveyQuestions length — Survey Builder V2 already lets a
// Company add/remove custom questions per campaign (campaign.service.ts),
// so a campaign with a different count would show a false question count
// right before the consumer starts. Converts to Eastern Arabic-Indic digits
// to match the surrounding Arabic copy's existing "٥" style.
const ARABIC_INDIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
function toArabicDigits(n: number): string {
  return String(n)
    .split('')
    .map((ch) => (ch >= '0' && ch <= '9' ? ARABIC_INDIC_DIGITS[Number(ch)] : ch))
    .join('');
}

export default function JoinPage() {
  const { campaign, campaignId } = useConsumerJourney();
  const navigate = useNavigate();

  if (!campaign) return null;

  const questionCount = campaign.surveyQuestions?.length || 5;

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
        {campaign.rewardPoints > 0 && (
          <div style={s.reward}>
            <span style={s.rewardNum}>{campaign.rewardPoints}</span>
            <span style={s.rewardLabel}>نقطة مكافأة</span>
          </div>
        )}
        <p style={s.steps}>
          {campaign.rewardPoints > 0
            ? `جرّب المنتج → أجب على ${toArabicDigits(questionCount)} أسئلة → واحصل على نقاطك`
            : `جرّب المنتج → أجب على ${toArabicDigits(questionCount)} أسئلة → وشاركنا رأيك`}
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

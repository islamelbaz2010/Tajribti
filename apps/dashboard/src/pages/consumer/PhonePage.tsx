import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConsumerJourney, consumerPost } from './JoinLayout';

export default function PhonePage() {
  const { campaignId } = useConsumerJourney();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('+20');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 12) { setError('يرجى إدخال رقم هاتف صحيح'); return; }
    setLoading(true);
    setError('');
    try {
      await consumerPost('/auth/otp/request', { phone });
      navigate(`/join/${campaignId}/otp`, { state: { phone } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <button style={s.back} onClick={() => navigate(`/join/${campaignId}`)}>← رجوع</button>
      <div style={s.body}>
        <h2 style={s.heading}>أدخل رقم هاتفك</h2>
        <p style={s.sub}>سنرسل لك رمز التحقق</p>
        <form onSubmit={handleSubmit} style={s.form}>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={s.input}
            placeholder="+201xxxxxxxxx"
            autoFocus
            dir="ltr"
          />
          {error && <p style={s.error}>{error}</p>}
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? '…' : 'إرسال الرمز'}
          </button>
        </form>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', flex: 1 },
  back: {
    background: 'none', border: 'none', color: '#6b7280', fontSize: 14,
    cursor: 'pointer', padding: '16px 20px', textAlign: 'right', fontFamily: 'sans-serif',
  },
  body: { padding: '16px 24px 40px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 },
  heading: { fontSize: 22, fontWeight: 800, color: '#1a1a2e', margin: 0, fontFamily: 'sans-serif' },
  sub: { fontSize: 14, color: '#6b7280', margin: '4px 0 24px', fontFamily: 'sans-serif' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: {
    border: '1.5px solid #d1d5db', borderRadius: 12, padding: '14px 16px',
    fontSize: 18, outline: 'none', fontFamily: 'monospace', textAlign: 'left' as const,
  },
  error: { color: '#e11d48', fontSize: 13, margin: 0, fontFamily: 'sans-serif' },
  btn: {
    background: '#1a1a2e', color: '#ffffff', border: 'none', borderRadius: 14,
    padding: '16px 24px', fontSize: 17, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'sans-serif', marginTop: 8,
  },
};

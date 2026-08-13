import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useConsumerJourney, consumerPost } from './JoinLayout';

export default function OtpPage() {
  const { campaignId, setConsumerToken, setIsNewUser, setRedemptionId } = useConsumerJourney();
  const navigate = useNavigate();
  const location = useLocation();
  const phone: string = (location.state as { phone?: string })?.phone ?? '';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) { setError('يرجى إدخال رمز التحقق كاملاً'); return; }
    setLoading(true);
    setError('');
    try {
      const verifyResult = await consumerPost('/auth/otp/verify', { phone, code });
      const token: string = verifyResult.accessToken;
      const newUser: boolean = verifyResult.isNewUser;
      setConsumerToken(token);
      setIsNewUser(newUser);

      // Enter the campaign immediately after auth
      const entryResult = await consumerPost(`/qr/enter/${campaignId}`, {}, token);
      setRedemptionId(entryResult.redemptionId);

      if (newUser) {
        navigate(`/join/${campaignId}/register`);
      } else {
        navigate(`/join/${campaignId}/survey`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'رمز التحقق غير صحيح أو منتهي الصلاحية.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <button style={s.back} onClick={() => navigate(`/join/${campaignId}/phone`)}>← رجوع</button>
      <div style={s.body}>
        <h2 style={s.heading}>رمز التحقق</h2>
        <p style={s.sub}>أدخل الرمز المرسل إلى {phone}</p>
        <form onSubmit={handleSubmit} style={s.form}>
          <input
            type="number"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={s.input}
            placeholder="0000"
            maxLength={6}
            autoFocus
            dir="ltr"
          />
          {error && <p style={s.error}>{error}</p>}
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? '…' : 'تأكيد'}
          </button>
        </form>
        <p style={s.hint}>في بيئة الاختبار، الرمز هو: 0000</p>
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
    fontSize: 28, fontWeight: 700, outline: 'none', letterSpacing: 8,
    textAlign: 'center' as const, fontFamily: 'monospace',
  },
  error: { color: '#e11d48', fontSize: 13, margin: 0, fontFamily: 'sans-serif' },
  btn: {
    background: '#1a1a2e', color: '#ffffff', border: 'none', borderRadius: 14,
    padding: '16px 24px', fontSize: 17, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'sans-serif', marginTop: 8,
  },
  hint: { fontSize: 12, color: '#9ca3af', marginTop: 12, fontFamily: 'sans-serif' },
};

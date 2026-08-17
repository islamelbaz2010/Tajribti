import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConsumerJourney, consumerPost } from './JoinLayout';

const AGE_OPTIONS = [
  { value: '18-24', label: '١٨–٢٤ سنة' },
  { value: '25-34', label: '٢٥–٣٤ سنة' },
  { value: '35-44', label: '٣٥–٤٤ سنة' },
  { value: '45-54', label: '٤٥–٥٤ سنة' },
  { value: '55+', label: '٥٥ سنة فأكثر' },
];
const GENDER_OPTIONS = [
  { value: 'male', label: 'ذكر' },
  { value: 'female', label: 'أنثى' },
  { value: 'prefer_not_to_say', label: 'أفضل عدم الإفصاح' },
];
const CITY_OPTIONS = [
  { value: 'Cairo', label: 'القاهرة' },
  { value: 'Giza', label: 'الجيزة' },
  { value: 'Alexandria', label: 'الإسكندرية' },
  { value: 'Other', label: 'أخرى' },
];

export default function RegisterPage() {
  const { campaignId, consumerToken } = useConsumerJourney();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ageRange || !gender || !city) {
      setError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await consumerPost('/auth/register', { name, ageRange, gender, city }, consumerToken);
      navigate(`/join/${campaignId}/survey`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <div style={s.body}>
        <h2 style={s.heading}>معلوماتك</h2>
        <p style={s.sub}>ساعدنا في فهم جمهورنا بشكل أفضل</p>
        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>الاسم</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={s.input}
            placeholder="اسمك الكريم"
          />

          <label style={s.label}>الفئة العمرية</label>
          <div style={s.optGroup}>
            {AGE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                style={{ ...s.opt, ...(ageRange === o.value ? s.optSelected : {}) }}
                onClick={() => setAgeRange(o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>

          <label style={s.label}>الجنس</label>
          <div style={s.optGroup}>
            {GENDER_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                style={{ ...s.opt, ...(gender === o.value ? s.optSelected : {}) }}
                onClick={() => setGender(o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>

          <label style={s.label}>المدينة</label>
          <div style={s.optGroup}>
            {CITY_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                style={{ ...s.opt, ...(city === o.value ? s.optSelected : {}) }}
                onClick={() => setCity(o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>

          {error && <p style={s.error}>{error}</p>}
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? '…' : 'التالي'}
          </button>
        </form>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', flex: 1 },
  body: { padding: '24px 24px 40px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  heading: { fontSize: 22, fontWeight: 800, color: '#1a1a2e', margin: 0, fontFamily: 'sans-serif' },
  sub: { fontSize: 14, color: '#6b7280', margin: '4px 0 20px', fontFamily: 'sans-serif' },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: 'sans-serif', marginTop: 8 },
  input: {
    border: '1.5px solid #d1d5db', borderRadius: 12, padding: '12px 14px',
    fontSize: 16, outline: 'none', fontFamily: 'sans-serif',
  },
  optGroup: { display: 'flex', flexWrap: 'wrap' as const, gap: 8 },
  opt: {
    background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 10,
    padding: '9px 14px', fontSize: 14, cursor: 'pointer', fontFamily: 'sans-serif',
    color: '#374151',
  },
  optSelected: { background: '#1a1a2e', color: '#ffffff', borderColor: '#1a1a2e' },
  error: { color: '#e11d48', fontSize: 13, margin: 0, fontFamily: 'sans-serif' },
  btn: {
    background: '#1a1a2e', color: '#ffffff', border: 'none', borderRadius: 14,
    padding: '16px 24px', fontSize: 17, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'sans-serif', marginTop: 16,
  },
};

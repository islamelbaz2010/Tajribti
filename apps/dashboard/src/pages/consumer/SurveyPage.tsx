import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConsumerJourney, consumerPost } from './JoinLayout';
import type { SurveyQuestion } from '../../api/types';

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 40, lineHeight: 1,
            color: n <= value ? '#f59e0b' : '#d1d5db',
            padding: 4,
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ScaleInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            style={{
              width: 48, height: 48, borderRadius: '50%', border: '2px solid',
              borderColor: n === value ? '#1a1a2e' : '#e5e7eb',
              background: n === value ? '#1a1a2e' : '#f9fafb',
              color: n === value ? '#fff' : '#374151',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {n}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'sans-serif' }}>غير محتمل</span>
        <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'sans-serif' }}>محتمل جداً</span>
      </div>
    </div>
  );
}

function ChoiceInput({
  options, optionsAr, rawOptions, value, onChange,
}: {
  options: string[];
  optionsAr: string[];
  rawOptions: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const labels = optionsAr.length > 0 ? optionsAr : options;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {labels.map((label, i) => {
        const raw = rawOptions[i];
        return (
          <button
            key={raw}
            type="button"
            onClick={() => onChange(raw)}
            style={{
              background: value === raw ? '#1a1a2e' : '#f9fafb',
              color: value === raw ? '#ffffff' : '#374151',
              border: `1.5px solid ${value === raw ? '#1a1a2e' : '#e5e7eb'}`,
              borderRadius: 12, padding: '14px 18px', fontSize: 15,
              cursor: 'pointer', textAlign: 'right' as const, fontFamily: 'sans-serif',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function TextInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      placeholder="اكتب رأيك هنا…"
      style={{
        border: '1.5px solid #d1d5db', borderRadius: 12, padding: '12px 14px',
        fontSize: 15, outline: 'none', resize: 'none' as const, fontFamily: 'sans-serif',
        width: '100%', boxSizing: 'border-box' as const,
      }}
    />
  );
}

export default function SurveyPage() {
  const { campaign, campaignId, consumerToken, redemptionId } = useConsumerJourney();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!campaign) return null;
  const questions: SurveyQuestion[] = campaign.surveyQuestions;
  if (questions.length === 0) return null;

  const q = questions[step];
  const isLast = step === questions.length - 1;
  const currentAnswer = answers[q.id];
  const canProceed = !q.required || (currentAnswer !== undefined && currentAnswer !== '' && currentAnswer !== 0);

  const setAnswer = (v: unknown) => setAnswers((prev) => ({ ...prev, [q.id]: v }));

  const handleNext = async () => {
    if (!canProceed) return;
    if (!isLast) { setStep((s) => s + 1); return; }

    setLoading(true);
    setError('');
    try {
      await consumerPost(
        '/survey/submit',
        { redemptionId, answers },
        consumerToken,
      );
      navigate(`/join/${campaignId}/thankyou`, { state: { points: campaign.rewardPoints } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'تعذر إرسال الإجابات.');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / questions.length) * 100;

  return (
    <div style={s.root}>
      <div style={s.progressBar}>
        <div style={{ ...s.progressFill, width: `${progress}%` }} />
      </div>
      <div style={s.body}>
        <p style={s.counter}>{step + 1} / {questions.length}</p>
        <h2 style={s.question}>{q.textAr || q.text}</h2>
        {!q.required && <p style={s.optional}>(اختياري)</p>}

        <div style={s.inputArea}>
          {q.type === 'stars' && (
            <StarInput value={Number(currentAnswer) || 0} onChange={setAnswer} />
          )}
          {q.type === 'scale' && (
            <ScaleInput value={Number(currentAnswer) || 0} onChange={setAnswer} />
          )}
          {q.type === 'multiple_choice' && (
            <ChoiceInput
              options={q.options ?? []}
              optionsAr={q.optionsAr ?? []}
              rawOptions={q.options ?? []}
              value={String(currentAnswer ?? '')}
              onChange={setAnswer}
            />
          )}
          {q.type === 'text' && (
            <TextInput value={String(currentAnswer ?? '')} onChange={setAnswer} />
          )}
        </div>

        {error && <p style={s.error}>{error}</p>}

        <button
          style={{ ...s.btn, ...(canProceed ? {} : s.btnDisabled) }}
          onClick={handleNext}
          disabled={!canProceed || loading}
        >
          {loading ? '…' : isLast ? 'إرسال الإجابات' : 'التالي'}
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', flex: 1 },
  progressBar: { height: 4, background: '#e5e7eb', borderRadius: 2 },
  progressFill: { height: '100%', background: '#1a1a2e', borderRadius: 2, transition: 'width 0.3s' },
  body: { padding: '24px 24px 40px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 },
  counter: { fontSize: 12, color: '#9ca3af', margin: 0, fontWeight: 600, fontFamily: 'sans-serif' },
  question: { fontSize: 20, fontWeight: 800, color: '#1a1a2e', margin: '4px 0 0', lineHeight: 1.4, fontFamily: 'sans-serif' },
  optional: { fontSize: 12, color: '#9ca3af', margin: 0, fontFamily: 'sans-serif' },
  inputArea: { marginTop: 24, marginBottom: 8 },
  error: { color: '#e11d48', fontSize: 13, margin: 0, fontFamily: 'sans-serif' },
  btn: {
    background: '#1a1a2e', color: '#ffffff', border: 'none', borderRadius: 14,
    padding: '16px 24px', fontSize: 17, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'sans-serif', marginTop: 'auto',
  },
  btnDisabled: { background: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' },
};

import React from 'react';
import type { SurveyQuestion } from '../api/types';

// Survey Builder V2 (Company Console Product Maturation, 2026-09-01;
// ordering fixed 2026-09-01): shared editor used by both
// CreateCampaign.tsx and CampaignDetail.tsx so the two forms can't drift
// apart. "Core" is an IDENTITY (reserved ids q1–q5), not a position —
// analytics/AI Insights/Report read answers by question id from a
// dictionary, never by array index (see campaign.service.ts
// CORE_QUESTION_IDS), so a core question's array position can move
// freely; only its id/type must stay fixed, which is why only
// wording/options are editable here for core questions. Custom questions
// (any other id) can be added, removed, retyped, and moved to ANY
// position — including before or between core questions — matching the
// backend's identity-based guard exactly.
const CORE_QUESTION_IDS = new Set(['q1', 'q2', 'q3', 'q4', 'q5']);
const MAX_QUESTIONS = 10;
const QUESTION_TYPES: SurveyQuestion['type'][] = ['stars', 'scale', 'multiple_choice', 'text'];
const TYPE_LABEL: Record<SurveyQuestion['type'], string> = {
  stars: 'Star rating',
  scale: '1–5 scale',
  multiple_choice: 'Multiple choice',
  text: 'Open text',
};

function newCustomQuestion(): SurveyQuestion {
  return {
    id: `custom_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    text: '',
    textAr: '',
    type: 'multiple_choice',
    options: ['', ''],
    optionsAr: ['', ''],
    required: false,
  };
}

export default function SurveyEditor({
  questions,
  onChange,
}: {
  questions: SurveyQuestion[];
  onChange: (next: SurveyQuestion[]) => void;
}) {
  const update = (index: number, patch: Partial<SurveyQuestion>) => {
    onChange(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const updateOptionList = (index: number, field: 'options' | 'optionsAr', raw: string) => {
    update(index, { [field]: raw.split(',').map((s) => s.trim()).filter(Boolean) });
  };

  const removeCustom = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
  };

  // Swaps a custom question with whichever question — core or custom —
  // currently sits in the adjacent slot. No positional floor/ceiling
  // beyond the array bounds: a custom question can walk all the way past
  // every core question if moved up enough times, landing before Q1.
  const moveCustom = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= questions.length) return;
    const next = [...questions];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const addCustom = () => {
    if (questions.length >= MAX_QUESTIONS) return;
    onChange([...questions, newCustomQuestion()]);
  };

  return (
    <div>
      <div style={styles.list}>
        {questions.map((q, i) => {
          const isCore = CORE_QUESTION_IDS.has(q.id);
          return (
            <div key={q.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={isCore ? styles.badgeCore : styles.badgeCustom}>
                  {isCore ? 'CORE' : 'CUSTOM'} · Q{i + 1}
                </span>
                {isCore ? (
                  <span style={styles.typeLabel}>{TYPE_LABEL[q.type]}</span>
                ) : (
                  <div style={styles.customControls}>
                    <select
                      style={styles.typeSelect}
                      value={q.type}
                      onChange={(e) => update(i, { type: e.target.value as SurveyQuestion['type'] })}
                    >
                      {QUESTION_TYPES.map((t) => (
                        <option key={t} value={t}>{TYPE_LABEL[t]}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      style={styles.iconBtn}
                      onClick={() => moveCustom(i, -1)}
                      disabled={i === 0}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      style={styles.iconBtn}
                      onClick={() => moveCustom(i, 1)}
                      disabled={i === questions.length - 1}
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      style={styles.removeBtn}
                      onClick={() => removeCustom(i)}
                      title="Remove question"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <input
                style={styles.input}
                value={q.text}
                onChange={(e) => update(i, { text: e.target.value })}
                placeholder="Question (English)"
              />
              <input
                style={{ ...styles.input, textAlign: 'right', direction: 'rtl' }}
                value={q.textAr}
                onChange={(e) => update(i, { textAr: e.target.value })}
                placeholder="السؤال (عربي)"
              />
              {q.type === 'multiple_choice' && (
                <>
                  <input
                    style={styles.input}
                    value={(q.options ?? []).join(', ')}
                    onChange={(e) => updateOptionList(i, 'options', e.target.value)}
                    placeholder="Options, comma-separated (English)"
                  />
                  <input
                    style={{ ...styles.input, textAlign: 'right', direction: 'rtl' }}
                    value={(q.optionsAr ?? []).join(', ')}
                    onChange={(e) => updateOptionList(i, 'optionsAr', e.target.value)}
                    placeholder="الخيارات، مفصولة بفاصلة (عربي)"
                  />
                </>
              )}
              {!isCore && (
                <label style={styles.requiredLabel}>
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) => update(i, { required: e.target.checked })}
                  />
                  Required
                </label>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        style={{ ...styles.addBtn, ...(questions.length >= MAX_QUESTIONS ? styles.addBtnDisabled : {}) }}
        onClick={addCustom}
        disabled={questions.length >= MAX_QUESTIONS}
      >
        {questions.length >= MAX_QUESTIONS
          ? `Maximum ${MAX_QUESTIONS} questions reached`
          : '+ Add Custom Question'}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
    marginBottom: 14,
  },
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
    background: '#f7f8fb',
    border: '1px solid #e8ecf3',
    borderRadius: 10,
    padding: 14,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap' as const,
  },
  badgeCore: {
    fontSize: 9,
    fontWeight: 800,
    color: '#4a5a7e',
    background: 'rgba(107, 127, 168, 0.1)',
    border: '1px solid rgba(107, 127, 168, 0.25)',
    borderRadius: 4,
    padding: '2px 8px',
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  badgeCustom: {
    fontSize: 9,
    fontWeight: 800,
    color: '#b2f24d',
    background: 'rgba(178, 242, 77, 0.08)',
    border: '1px solid rgba(178, 242, 77, 0.2)',
    borderRadius: 4,
    padding: '2px 8px',
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  typeLabel: { fontSize: 11, color: '#4a5a7e' },
  customControls: { display: 'flex', alignItems: 'center', gap: 6 },
  typeSelect: {
    background: '#f7f8fb',
    border: '1px solid #dde3ee',
    borderRadius: 6,
    padding: '4px 8px',
    color: '#0a1120',
    fontSize: 11,
    fontFamily: 'inherit',
  },
  iconBtn: {
    background: 'transparent',
    border: '1px solid #dde3ee',
    color: '#4a5a7e',
    borderRadius: 6,
    width: 24,
    height: 24,
    fontSize: 12,
    cursor: 'pointer',
    lineHeight: 1,
  },
  removeBtn: {
    background: 'transparent',
    border: '1px solid rgba(251, 113, 133, 0.3)',
    color: '#dc2626',
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  },
  input: {
    background: '#ffffff',
    border: '1px solid #e8ecf3',
    borderRadius: 8,
    padding: '9px 12px',
    fontSize: 13,
    color: '#0a1120',
    outline: 'none',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  requiredLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    color: '#4a5a7e',
    fontWeight: 600,
  },
  addBtn: {
    background: 'rgba(178, 242, 77, 0.08)',
    border: '1px solid rgba(178, 242, 77, 0.25)',
    color: '#b2f24d',
    borderRadius: 8,
    padding: '10px 16px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    width: '100%',
  },
  addBtnDisabled: {
    background: 'transparent',
    border: '1px solid #e8ecf3',
    color: '#7a8bab',
    cursor: 'not-allowed',
  },
};

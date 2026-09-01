import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignApi } from '../api/endpoints';
import type { SurveyQuestion } from '../api/types';
import SurveyEditor from '../components/SurveyEditor';

// Campaign-creation form. Reuses the existing POST /campaigns contract
// (CreateCampaignDto) — status/demo flag are still set server-side. The
// optional `surveyQuestions` field starts as the standard 5-question core
// set; SurveyEditor (Survey Builder V2) lets the Company reword/reoption
// those and append its own campaign/product-specific custom questions
// before the campaign is even created.
const DEFAULT_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'q1',
    text: 'What was your first impression of this product?',
    textAr: 'ما هو انطباعك الأول عن هذا المنتج؟',
    type: 'stars',
    required: true,
  },
  {
    id: 'q2',
    text: 'How likely are you to buy this product at a store?',
    textAr: 'ما مدى احتمالية شراؤك لهذا المنتج من المتجر؟',
    type: 'scale',
    required: true,
  },
  {
    id: 'q3',
    text: 'Which word best describes this product?',
    textAr: 'أي كلمة تصف هذا المنتج بشكل أفضل؟',
    type: 'multiple_choice',
    options: ['Fresh', 'Light', 'Refreshing', 'Balanced', 'Natural'],
    optionsAr: ['منعش', 'خفيف', 'مرطب', 'متوازن', 'طبيعي'],
    required: true,
  },
  {
    id: 'q4',
    text: 'Compared to similar products, this is:',
    textAr: 'مقارنة بالمنتجات المماثلة، هذا المنتج:',
    type: 'multiple_choice',
    options: ['Much Better', 'Better', 'About the Same', 'Worse'],
    optionsAr: ['أفضل بكثير', 'أفضل', 'مماثل', 'أسوأ'],
    required: true,
  },
  {
    id: 'q5',
    text: 'Any other comments? (optional)',
    textAr: 'أي تعليقات إضافية؟ (اختياري)',
    type: 'text',
    required: false,
  },
];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [customizeSurvey, setCustomizeSurvey] = useState(false);
  const [questions, setQuestions] = useState<SurveyQuestion[]>(DEFAULT_QUESTIONS);

  const [brandName, setBrandName] = useState('');
  const [productName, setProductName] = useState('');
  const [productImage, setProductImage] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [description, setDescription] = useState('');
  const [rewardPoints, setRewardPoints] = useState(50);
  const [targetCount, setTargetCount] = useState(100);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = brandName.trim().length > 0 && productName.trim().length > 0 && !submitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const campaign = await campaignApi.create({
        brandName: brandName.trim(),
        productName: productName.trim(),
        productImage: productImage.trim() || undefined,
        description: description.trim() || undefined,
        locationName: locationName.trim() || undefined,
        locationAddress: locationAddress.trim() || undefined,
        rewardPoints,
        targetCount,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        surveyQuestions: customizeSurvey ? questions : undefined,
      });
      navigate(`/overview?campaignId=${campaign.id}`);
    } catch (err) {
      setError('Could not create the campaign. Check the required fields and try again.');
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <h1 style={styles.title}>New Campaign</h1>
        <p style={styles.sub}>
          Set up a new trial campaign. It uses the standard Tajribti trial survey — the same
          format as every other campaign on this account.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.grid}>
          <Field label="Brand Name" required>
            <input
              style={styles.input}
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. Sprite Zero Egypt"
              required
              autoFocus
            />
          </Field>
          <Field label="Product Name" required>
            <input
              style={styles.input}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Sprite Zero Sugar"
              required
            />
          </Field>
          <Field label="Product Image URL">
            <input
              style={styles.input}
              value={productImage}
              onChange={(e) => setProductImage(e.target.value)}
              placeholder="https://…"
            />
          </Field>
          <Field label="Location Name">
            <input
              style={styles.input}
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. City Stars Mall — Ground Floor Atrium"
            />
          </Field>
          <Field label="Location Address">
            <input
              style={styles.input}
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              placeholder="Optional full address"
            />
          </Field>
          <Field label="Reward Points" required>
            <input
              type="number"
              min={0}
              style={styles.input}
              value={rewardPoints}
              onChange={(e) => setRewardPoints(Number(e.target.value))}
              required
            />
          </Field>
          <Field label="Target Trial Count" required>
            <input
              type="number"
              min={1}
              style={styles.input}
              value={targetCount}
              onChange={(e) => setTargetCount(Number(e.target.value))}
              required
            />
          </Field>
          <Field label="Start Date">
            <input
              type="date"
              style={styles.input}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Field>
          <Field label="End Date">
            <input
              type="date"
              style={styles.input}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Description" full>
          <textarea
            style={{ ...styles.input, ...styles.textarea }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional short description of this trial"
            rows={3}
          />
        </Field>

        <div style={styles.surveyToggle}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={customizeSurvey}
              onChange={(e) => setCustomizeSurvey(e.target.checked)}
            />
            Configure the research survey for this campaign (optional — standard survey used
            otherwise)
          </label>
        </div>

        {customizeSurvey && (
          <div style={styles.surveySection}>
            <p style={styles.surveyHint}>
              The 5 core questions cover the standard trial research (impression, purchase
              intent, descriptor, comparison, open feedback) — reword them for this
              product/category if useful. Add your own questions for anything specific to this
              campaign, product, or industry, and use the ↑/↓ controls to place them anywhere in
              the survey, including ahead of a core question.
            </p>
            <SurveyEditor questions={questions} onChange={setQuestions} />
          </div>
        )}

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.actions}>
          <button type="submit" style={styles.btn} disabled={!canSubmit}>
            {submitting ? 'Creating…' : 'Create Campaign →'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ ...styles.field, ...(full ? styles.fieldFull : {}) }}>
      <label style={styles.label}>
        {label}
        {required && <span style={styles.required}> *</span>}
      </label>
      {children}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { maxWidth: 720 },
  header: { marginBottom: 28 },
  title: { fontSize: 24, fontWeight: 800, color: '#edf0ff', margin: '0 0 6px', letterSpacing: -0.3 },
  sub: { fontSize: 13, color: '#6b7fa8', margin: 0, lineHeight: 1.5 },
  form: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 16,
    padding: 28,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 18,
  },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldFull: { gridColumn: '1 / -1' },
  label: { fontSize: 11, fontWeight: 700, color: '#6b7fa8', letterSpacing: 0.4 },
  required: { color: '#b2f24d' },
  input: {
    background: '#070c1a',
    border: '1px solid #1a2540',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    color: '#edf0ff',
    outline: 'none',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  textarea: { resize: 'vertical' as const, fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  error: {
    fontSize: 12,
    color: '#fb7185',
    background: 'rgba(251, 113, 133, 0.08)',
    border: '1px solid rgba(251, 113, 133, 0.2)',
    borderRadius: 6,
    padding: '8px 12px',
    margin: 0,
  },
  surveyToggle: { borderTop: '1px solid #111d35', paddingTop: 16 },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 12,
    color: '#6b7fa8',
    fontWeight: 600,
    cursor: 'pointer',
  },
  surveySection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 14,
    background: '#070c1a',
    border: '1px solid #111d35',
    borderRadius: 12,
    padding: 18,
  },
  surveyHint: { fontSize: 12, color: '#6b7fa8', margin: 0, lineHeight: 1.5 },
  questionCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 10,
    padding: 14,
  },
  questionLabel: { fontSize: 10, fontWeight: 800, color: '#b2f24d', letterSpacing: 0.5, textTransform: 'uppercase' as const },
  actions: { display: 'flex', justifyContent: 'flex-end' },
  btn: {
    background: '#b2f24d',
    color: '#040812',
    border: 'none',
    borderRadius: 8,
    padding: '12px 24px',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
    letterSpacing: 0.3,
  },
};

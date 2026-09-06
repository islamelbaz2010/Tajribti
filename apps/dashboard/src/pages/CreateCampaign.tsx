import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignApi, companyApi } from '../api/endpoints';
import type { SurveyQuestion, BrandContact } from '../api/types';
import { VALID_AGE_RANGES } from '../api/types';
import SurveyEditor from '../components/SurveyEditor';

// Benchmark Alignment — Campaign Creation (2026-09-06, DL-101)
//
// This form now implements the benchmark-quality campaign configuration
// experience guided by ExpertVoice Campaign Manager, Zamplit, and Sampl:
//
//   Objective → Product → Location → Dates/Capacity → Audience → Survey → Save
//
// Campaigns are created as DRAFT (not immediately ACTIVE). The Company
// reviews the configuration on the Campaign Detail page and explicitly
// launches (DRAFT → ACTIVE) when ready. This matches the benchmark's
// "preview/save-before-launch" workflow.
//
// Audience targeting (audienceGender, audienceAgeRanges) is the first
// implementation of server-enforced campaign eligibility. Restrictions are
// optional — leaving them empty means "no restriction" (all consumers
// eligible).

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

  // ── Section 1: Objective ──────────────────────────────────────────────────
  const [objective, setObjective] = useState('');

  // ── Section 2: Product ────────────────────────────────────────────────────
  const [brandName, setBrandName] = useState('');
  const [productName, setProductName] = useState('');
  const [productImage, setProductImage] = useState('');
  const [description, setDescription] = useState('');

  // ── Section 3: Location ───────────────────────────────────────────────────
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');

  // ── Section 4: Dates & Capacity ──────────────────────────────────────────
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [targetCount, setTargetCount] = useState(100);
  const [rewardPoints, setRewardPoints] = useState(50);

  // ── Section 5: Audience ───────────────────────────────────────────────────
  // Benchmark: "Targeting is an explicit campaign concern" (ExpertVoice, Sampl)
  // NULL = no restriction; 'male'/'female' = gender-restricted
  const [audienceGender, setAudienceGender] = useState<'' | 'male' | 'female'>('');
  // Empty array = no restriction; otherwise, only consumers in these ranges
  const [audienceAgeRanges, setAudienceAgeRanges] = useState<string[]>([]);

  // ── Section 6: Campaign Contact ───────────────────────────────────────────
  const [contactId, setContactId] = useState('');
  const [contacts, setContacts] = useState<BrandContact[]>([]);

  // ── Section 7: Survey ─────────────────────────────────────────────────────
  const [customizeSurvey, setCustomizeSurvey] = useState(false);
  const [questions, setQuestions] = useState<SurveyQuestion[]>(DEFAULT_QUESTIONS);
  const [framework, setFramework] = useState<SurveyQuestion[]>([]);

  // ── State ─────────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    companyApi.getContacts().then(setContacts).catch(() => setContacts([]));
    companyApi.getSectorFramework().then(setFramework).catch(() => setFramework([]));
    // Pre-fill Brand Name from the authenticated Company's own account name
    // so a Company does not have to manually type their own name, and so the
    // campaign is always correctly associated with the current Company account.
    // brandName is still editable in case the campaign uses a sub-brand name.
    companyApi.getMe().then((company) => {
      if (company?.name) setBrandName(company.name);
    }).catch(() => { /* non-fatal — user can still type it */ });
  }, []);

  const toggleAgeRange = (range: string) => {
    setAudienceAgeRanges((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range],
    );
  };

  const addFrameworkQuestion = (q: SurveyQuestion) => {
    if (questions.some((existing) => existing.id === q.id)) return;
    setCustomizeSurvey(true);
    setQuestions((prev) => [...prev, q]);
  };

  const canSubmit = brandName.trim().length > 0 && productName.trim().length > 0 && !submitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (startDate && endDate && endDate < startDate) {
      setError('End date cannot be earlier than start date.');
      return;
    }
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
        contactId: contactId || undefined,
        surveyQuestions: customizeSurvey ? questions : undefined,
        objective: objective.trim() || undefined,
        audienceGender: audienceGender || undefined,
        audienceAgeRanges: audienceAgeRanges.length > 0 ? audienceAgeRanges : undefined,
      });
      navigate(`/campaign?campaignId=${campaign.id}`);
    } catch {
      setError('Could not create the campaign. Check the required fields and try again.');
      setSubmitting(false);
    }
  };

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>New Campaign</h1>
        <p style={s.sub}>
          Configure your trial campaign. It will be saved as a{' '}
          <strong style={{ color: '#6b7fe8' }}>Draft</strong> — launch it from the Campaign
          page when you're ready.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={s.form}>

        {/* ── Section 1: Objective ─────────────────────────────────────── */}
        <Section title="Campaign Objective" hint="What do you want to learn or validate from this trial?">
          <Field label="Objective" full>
            <textarea
              style={{ ...s.input, ...s.textarea }}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="e.g. Measure purchase intent and first-impression score for Sprite Zero in Cairo, targeting women aged 18–34."
              rows={2}
              maxLength={500}
            />
          </Field>
        </Section>

        {/* ── Section 2: Product ───────────────────────────────────────── */}
        <Section title="Product" hint="The brand and product consumers will trial.">
          <div style={s.grid}>
            <Field label="Brand Name" required>
              <input
                style={s.input}
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Sprite Zero Egypt"
                required
                autoFocus
              />
            </Field>
            <Field label="Product Name" required>
              <input
                style={s.input}
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Sprite Zero Sugar"
                required
              />
            </Field>
            <Field label="Product Image URL" full>
              <input
                style={s.input}
                value={productImage}
                onChange={(e) => setProductImage(e.target.value)}
                placeholder="https://…"
              />
            </Field>
            <Field label="Description" full>
              <textarea
                style={{ ...s.input, ...s.textarea }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional short description of this trial"
                rows={2}
              />
            </Field>
          </div>
        </Section>

        {/* ── Section 3: Location ─────────────────────────────────────── */}
        <Section title="Location" hint="Where consumers will collect/experience the product (optional).">
          <div style={s.grid}>
            <Field label="Location Name">
              <input
                style={s.input}
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. City Stars Mall — Ground Floor Atrium"
              />
            </Field>
            <Field label="Location Address">
              <input
                style={s.input}
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="Optional full address"
              />
            </Field>
          </div>
        </Section>

        {/* ── Section 4: Dates & Capacity ─────────────────────────────── */}
        <Section title="Dates & Capacity" hint="Control when the campaign runs and how many participants it accepts.">
          <div style={s.grid}>
            <Field label="Start Date">
              <input
                type="date"
                style={s.input}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Field>
            <Field label="End Date">
              <input
                type="date"
                style={s.input}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Field>
            <Field label="Target Trial Count" required>
              <input
                type="number"
                min={1}
                style={s.input}
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                required
              />
            </Field>
            <Field label="Reward Points" required>
              <input
                type="number"
                min={0}
                style={s.input}
                value={rewardPoints}
                onChange={(e) => setRewardPoints(Number(e.target.value))}
                required
              />
            </Field>
          </div>
        </Section>

        {/* ── Section 5: Audience ─────────────────────────────────────── */}
        {/* Benchmark: ExpertVoice, Sampl, Zamplit — targeting is explicit  */}
        <Section
          title="Audience"
          hint="Restrict participation to a specific audience. Leave both fields empty for no restriction — all verified consumers will be eligible."
          badge="Eligibility enforced"
        >
          <div style={s.audienceGrid}>
            <div style={s.audienceBlock}>
              <p style={s.audienceLabel}>Gender</p>
              <div style={s.radioGroup}>
                {(['', 'female', 'male'] as const).map((v) => (
                  <label key={v} style={s.radioLabel}>
                    <input
                      type="radio"
                      name="audienceGender"
                      value={v}
                      checked={audienceGender === v}
                      onChange={() => setAudienceGender(v)}
                      style={{ accentColor: '#b2f24d' }}
                    />
                    <span>
                      {v === '' ? 'All genders' : v === 'female' ? 'Female only' : 'Male only'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div style={s.audienceBlock}>
              <p style={s.audienceLabel}>Age Ranges</p>
              <p style={s.audienceHint}>
                {audienceAgeRanges.length === 0
                  ? 'All ages eligible'
                  : `Eligible: ${audienceAgeRanges.join(', ')}`}
              </p>
              <div style={s.checkboxGroup}>
                {VALID_AGE_RANGES.map((range) => (
                  <label key={range} style={s.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={audienceAgeRanges.includes(range)}
                      onChange={() => toggleAgeRange(range)}
                      style={{ accentColor: '#b2f24d' }}
                    />
                    <span>{range}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {(audienceGender !== '' || audienceAgeRanges.length > 0) && (
            <div style={s.eligibilityNote}>
              <span style={s.eligibilityIcon}>🔒</span>
              <span>
                Consumers who don't match{' '}
                {[
                  audienceGender ? `gender: ${audienceGender}` : null,
                  audienceAgeRanges.length > 0
                    ? `age: ${audienceAgeRanges.join(' / ')}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(', ')}{' '}
                will be blocked from participation — server-enforced.
              </span>
            </div>
          )}
        </Section>

        {/* ── Section 6: Campaign Contact ─────────────────────────────── */}
        {contacts.length > 0 && (
          <Section title="Campaign Contact" hint="Who at your company is responsible for this campaign?">
            <Field label="Contact">
              <select
                style={s.input}
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
              >
                <option value="">— None —</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.role ? ` (${c.role})` : ''}
                  </option>
                ))}
              </select>
            </Field>
          </Section>
        )}

        {/* ── Section 7: Survey ───────────────────────────────────────── */}
        <Section title="Research Survey" hint="The Tajribti standard 5-question survey covers impression, purchase intent, descriptor, comparison, and open feedback. Customize or add questions below.">
          <div style={s.surveyToggle}>
            <label style={s.checkboxLabel}>
              <input
                type="checkbox"
                checked={customizeSurvey}
                onChange={(e) => setCustomizeSurvey(e.target.checked)}
                style={{ accentColor: '#b2f24d' }}
              />
              Customize the survey for this campaign
            </label>
          </div>

          {customizeSurvey && (
            <div style={s.surveySection}>
              <p style={s.surveyHint}>
                The 5 core questions cover standard trial research — reword them for this
                product/category if useful. Add your own questions for anything specific to this
                campaign, and use ↑/↓ to place them anywhere in the survey.
              </p>

              {framework.length > 0 && (
                <div style={s.frameworkBox}>
                  <p style={s.frameworkTitle}>Recommended for your industry</p>
                  {framework.map((q) => {
                    const added = questions.some((existing) => existing.id === q.id);
                    return (
                      <div key={q.id} style={s.frameworkRow}>
                        <span style={s.frameworkText}>{q.text}</span>
                        <button
                          type="button"
                          style={added ? s.frameworkAddedBtn : s.frameworkAddBtn}
                          disabled={added}
                          onClick={() => addFrameworkQuestion(q)}
                        >
                          {added ? 'Added' : '+ Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <SurveyEditor questions={questions} onChange={setQuestions} />
            </div>
          )}
        </Section>

        {/* ── Error + Submit ───────────────────────────────────────────── */}
        {error && <p style={s.error}>{error}</p>}

        <div style={s.actions}>
          <div style={s.draftNote}>
            Campaign will be saved as <strong>Draft</strong>. Launch it from the Campaign page
            when ready.
          </div>
          <button type="submit" style={s.btn} disabled={!canSubmit}>
            {submitting ? 'Saving…' : 'Save Draft →'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  title,
  hint,
  badge,
  children,
}: {
  title: string;
  hint?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={s.section}>
      <div style={s.sectionHeader}>
        <div style={s.sectionTitleRow}>
          <h2 style={s.sectionTitle}>{title}</h2>
          {badge && <span style={s.badge}>{badge}</span>}
        </div>
        {hint && <p style={s.sectionHint}>{hint}</p>}
      </div>
      {children}
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
    <div style={{ ...s.field, ...(full ? s.fieldFull : {}) }}>
      <label style={s.label}>
        {label}
        {required && <span style={s.required}> *</span>}
      </label>
      {children}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  root: { maxWidth: 760 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 800, color: '#0a1120', margin: '0 0 6px', letterSpacing: -0.3 },
  sub: { fontSize: 13, color: '#4a5a7e', margin: 0, lineHeight: 1.6 },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  // ── Section ──
  section: {
    background: '#ffffff',
    border: '1px solid #e8ecf3',
    borderRadius: 16,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginBottom: 16,
  },
  sectionHeader: { display: 'flex', flexDirection: 'column', gap: 4 },
  sectionTitleRow: { display: 'flex', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 13, fontWeight: 800, color: '#0a1120', margin: 0, letterSpacing: 0.1 },
  sectionHint: { fontSize: 12, color: '#6b7899', margin: 0, lineHeight: 1.5 },
  badge: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    background: 'rgba(178, 242, 77, 0.12)',
    color: '#7ab023',
    border: '1px solid rgba(178, 242, 77, 0.3)',
    borderRadius: 6,
    padding: '2px 8px',
  },
  // ── Grid ──
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
  },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldFull: { gridColumn: '1 / -1' },
  label: { fontSize: 11, fontWeight: 700, color: '#4a5a7e', letterSpacing: 0.4 },
  required: { color: '#b2f24d' },
  input: {
    background: '#f7f8fb',
    border: '1px solid #dde3ee',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    color: '#0a1120',
    outline: 'none',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  textarea: { resize: 'vertical' as const, fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  // ── Audience ──
  audienceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
  },
  audienceBlock: { display: 'flex', flexDirection: 'column', gap: 8 },
  audienceLabel: { fontSize: 11, fontWeight: 700, color: '#4a5a7e', letterSpacing: 0.4, margin: 0 },
  audienceHint: { fontSize: 11, color: '#8a99b8', margin: 0 },
  radioGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: '#374151',
    cursor: 'pointer',
  },
  checkboxGroup: { display: 'flex', flexWrap: 'wrap' as const, gap: 8 },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#374151',
    cursor: 'pointer',
    fontWeight: 600,
  },
  eligibilityNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    background: 'rgba(178, 242, 77, 0.06)',
    border: '1px solid rgba(178, 242, 77, 0.2)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 12,
    color: '#374151',
    lineHeight: 1.5,
  },
  eligibilityIcon: { fontSize: 14, marginTop: 1 },
  // ── Survey ──
  surveyToggle: {},
  surveySection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 14,
    background: '#f7f8fb',
    border: '1px solid #e8ecf3',
    borderRadius: 12,
    padding: 18,
  },
  surveyHint: { fontSize: 12, color: '#4a5a7e', margin: 0, lineHeight: 1.5 },
  frameworkBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
    background: 'rgba(178, 242, 77, 0.05)',
    border: '1px solid rgba(178, 242, 77, 0.2)',
    borderRadius: 10,
    padding: 14,
  },
  frameworkTitle: {
    fontSize: 10, fontWeight: 800, color: '#b2f24d', letterSpacing: 0.5,
    textTransform: 'uppercase' as const, margin: '0 0 4px',
  },
  frameworkRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  frameworkText: { fontSize: 12, color: '#374151', flex: 1 },
  frameworkAddBtn: {
    background: 'transparent', border: '1px solid #b2f24d', color: '#b2f24d',
    borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  frameworkAddedBtn: {
    background: 'transparent', border: '1px solid #dde3ee', color: '#4a5a7e',
    borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'default',
    whiteSpace: 'nowrap' as const,
  },
  // ── Error + Actions ──
  error: {
    fontSize: 12, color: '#dc2626',
    background: 'rgba(251, 113, 133, 0.08)',
    border: '1px solid rgba(251, 113, 133, 0.2)',
    borderRadius: 6, padding: '8px 12px', margin: 0,
  },
  actions: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 0 4px',
  },
  draftNote: { fontSize: 12, color: '#6b7899' },
  btn: {
    background: '#b2f24d', color: '#040812', border: 'none',
    borderRadius: 8, padding: '12px 28px', fontSize: 13, fontWeight: 800,
    cursor: 'pointer', letterSpacing: 0.3,
  },
};

import React from 'react';
import { Link } from 'react-router-dom';
import { SECTOR_LABELS } from '../../api/types';

// Public marketing site (Commercial V1 Completion Sprint, 2026-09-01):
// TAJRIBTI's first public-facing surface — the repository previously had
// none (every route was the authenticated Company Console or the
// consumer-web QR fallback). Deliberately a separate, light-first visual
// layer from the dark Console theme, in the same app/deployment (no new
// Vercel project, no new repo) — reuses the brand accent (#b2f24d) and
// dark-navy text color for continuity, per this task's explicit
// "same product, different job" direction. No fabricated stats,
// testimonials, or client logos — every claim here is either the
// established product positioning (workspace/AI_BOOTSTRAP) or a link to
// a real, working, unauthenticated capability (the Sample Report).
const SECTORS = Object.values(SECTOR_LABELS);

const STEPS = [
  {
    n: '01',
    title: 'Company configures the campaign',
    body: 'Product, sector, dates, reward, and a campaign-specific research survey — built on core trial-research questions plus your own.',
  },
  {
    n: '02',
    title: 'Consumers discover it on Tajribti',
    body: 'The campaign appears in the Tajribti consumer app — as an active trial, or "Coming Soon" if it hasn’t started yet.',
  },
  {
    n: '03',
    title: 'Consumers try the product',
    body: 'A consumer picks up the product, scans the campaign QR code, and verifies with a one-time WhatsApp code.',
  },
  {
    n: '04',
    title: 'Consumers answer the survey',
    body: 'Right after the trial — while the experience is fresh — not a recall survey sent days later.',
  },
  {
    n: '05',
    title: 'Responses become structured data',
    body: 'Every answer is stored against the real campaign, the real question, and the real respondent — nothing fabricated, nothing inferred.',
  },
  {
    n: '06',
    title: 'You receive a professional report',
    body: 'Demographics, purchase intent, product perception, verbatim feedback, AI-assisted insights, and clear recommendations — grounded entirely in what consumers actually said.',
  },
];

const DELIVERABLES = [
  'Verified participant demographics',
  'Purchase intent, measured immediately post-trial',
  'Product perception & descriptor analysis',
  'Open-ended consumer verbatims',
  'Campaign-specific questions you configured',
  'AI-assisted, evidence-grounded key findings',
  'Actionable recommendations',
  'Full methodology & data-limitations disclosure',
];

export default function PublicHome() {
  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo}>TAJRIBTI</div>
          <nav style={s.nav}>
            <a href="#how-it-works" style={s.navLink}>How it works</a>
            <a href="#what-you-get" style={s.navLink}>What you get</a>
            <Link to="/sample-report" style={s.navLink}>Sample Report</Link>
            <Link to="/login" style={s.navLoginBtn}>Company Login</Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroEyebrow}>CONSUMER INSIGHTS &amp; FEEDBACK</div>
          <h1 style={s.heroTitle}>We turn product trial into key data.</h1>
          <p style={s.heroSub}>
            We listen to consumers to optimize your marketing strategy — turning a real,
            in-hand product trial into structured, decision-ready Consumer Insights.
          </p>
          <div style={s.heroCtas}>
            <Link to="/sample-report" style={s.ctaPrimary}>View a Sample Report &rarr;</Link>
            <Link to="/login" style={s.ctaSecondary}>Company Login</Link>
          </div>
        </div>
      </section>

      {/* ── VALUE PROPS ── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.grid4}>
            {[
              ['Real Trial', 'A physical product in a consumer’s hands — not a recall survey or a panel opinion.'],
              ['Structured Feedback', 'A campaign-specific survey captures purchase intent, perception, and open feedback right after the trial.'],
              ['Verified Consumers', 'Every participant authenticates via a one-time WhatsApp code — no bots, no duplicate entries.'],
              ['A Report, Not a Dashboard', 'Findings, evidence, and recommendations — delivered as a document you can actually send around.'],
            ].map(([title, body]) => (
              <div key={title} style={s.valueCard}>
                <div style={s.valueTitle}>{title}</div>
                <div style={s.valueBody}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ ...s.section, background: '#f7f8fb' }}>
        <div style={s.sectionInner}>
          <div style={s.sectionLabel}>HOW IT WORKS</div>
          <h2 style={s.sectionTitle}>From product trial to business decision</h2>
          <div style={s.stepsList}>
            {STEPS.map((step) => (
              <div key={step.n} style={s.stepRow}>
                <div style={s.stepNum}>{step.n}</div>
                <div>
                  <div style={s.stepTitle}>{step.title}</div>
                  <div style={s.stepBody}>{step.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section id="what-you-get" style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionLabel}>WHAT YOU GET</div>
          <h2 style={s.sectionTitle}>A professional Consumer Insights &amp; Feedback report</h2>
          <p style={s.sectionSub}>
            Every number in it traces back to a real, verified consumer response — never a
            placeholder, never an inferred statistic.
          </p>
          <div style={s.deliverableGrid}>
            {DELIVERABLES.map((d) => (
              <div key={d} style={s.deliverableRow}>
                <span style={s.checkMark}>&#10003;</span>
                {d}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 32 }}>
            <Link to="/sample-report" style={s.ctaPrimary}>See it for yourself &rarr;</Link>
          </div>
        </div>
      </section>

      {/* ── SECTORS ── */}
      <section style={{ ...s.section, background: '#f7f8fb' }}>
        <div style={s.sectionInner}>
          <div style={s.sectionLabel}>BUILT FOR</div>
          <h2 style={s.sectionTitle}>Sector-aware research, from the first question</h2>
          <p style={s.sectionSub}>
            Tajribti currently supports campaigns for:
          </p>
          <div style={s.sectorRow}>
            {SECTORS.map((sec) => (
              <span key={sec} style={s.sectorChip}>{sec}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={s.finalCta}>
        <div style={s.sectionInner}>
          <h2 style={s.finalCtaTitle}>See what your consumers would actually say.</h2>
          <div style={s.heroCtas}>
            <Link to="/sample-report" style={s.ctaPrimaryDark}>View a Sample Report &rarr;</Link>
            <Link to="/login" style={s.ctaSecondaryDark}>Company Login</Link>
          </div>
        </div>
      </section>

      <footer style={s.footer}>
        <div style={s.sectionInner}>
          <div style={s.footerRow}>
            <span style={s.footerLogo}>TAJRIBTI</span>
            <span style={s.footerTag}>Consumer Intelligence Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    background: '#ffffff',
    color: '#0a1120',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    minHeight: '100vh',
  },
  header: {
    borderBottom: '1px solid #eceef3',
    position: 'sticky' as const,
    top: 0,
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(6px)',
    zIndex: 10,
  },
  headerInner: {
    maxWidth: 1120,
    margin: '0 auto',
    padding: '18px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { fontSize: 16, fontWeight: 900, letterSpacing: 3, color: '#0a1120' },
  nav: { display: 'flex', alignItems: 'center', gap: 28 },
  navLink: { fontSize: 13, fontWeight: 600, color: '#4a5a7e', textDecoration: 'none' },
  navLoginBtn: {
    fontSize: 13,
    fontWeight: 700,
    color: '#0a1120',
    textDecoration: 'none',
    border: '1px solid #d7dbe6',
    borderRadius: 8,
    padding: '8px 16px',
  },
  hero: {
    padding: '100px 24px 90px',
    background: 'linear-gradient(180deg, #fbfdf6 0%, #ffffff 70%)',
  },
  heroInner: { maxWidth: 760, margin: '0 auto', textAlign: 'center' as const },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 2,
    color: '#5c7a1f',
    background: 'rgba(178,242,77,0.18)',
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: 20,
    marginBottom: 22,
  },
  heroTitle: {
    fontSize: 46,
    fontWeight: 900,
    letterSpacing: -1,
    lineHeight: 1.12,
    margin: '0 0 20px',
    color: '#0a1120',
  },
  heroSub: {
    fontSize: 17,
    lineHeight: 1.6,
    color: '#4a5a7e',
    maxWidth: 580,
    margin: '0 auto 36px',
  },
  heroCtas: { display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' as const },
  ctaPrimary: {
    background: '#b2f24d',
    color: '#0a1120',
    textDecoration: 'none',
    fontWeight: 800,
    fontSize: 14,
    padding: '14px 26px',
    borderRadius: 10,
  },
  ctaSecondary: {
    background: 'transparent',
    color: '#0a1120',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 14,
    padding: '14px 26px',
    borderRadius: 10,
    border: '1px solid #d7dbe6',
  },
  ctaPrimaryDark: {
    background: '#b2f24d',
    color: '#0a1120',
    textDecoration: 'none',
    fontWeight: 800,
    fontSize: 14,
    padding: '14px 26px',
    borderRadius: 10,
  },
  ctaSecondaryDark: {
    background: 'transparent',
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 14,
    padding: '14px 26px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.3)',
  },
  section: { padding: '80px 24px' },
  sectionInner: { maxWidth: 1000, margin: '0 auto' },
  sectionLabel: { fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#7a8bab', marginBottom: 10 },
  sectionTitle: { fontSize: 30, fontWeight: 800, color: '#0a1120', margin: '0 0 16px', letterSpacing: -0.5, maxWidth: 640 },
  sectionSub: { fontSize: 15, color: '#4a5a7e', lineHeight: 1.6, maxWidth: 560, marginBottom: 8 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 },
  valueCard: {
    background: '#fafbfd',
    border: '1px solid #eceef3',
    borderRadius: 14,
    padding: 24,
  },
  valueTitle: { fontSize: 15, fontWeight: 800, color: '#0a1120', marginBottom: 10 },
  valueBody: { fontSize: 13, color: '#4a5a7e', lineHeight: 1.6 },
  stepsList: { display: 'flex', flexDirection: 'column' as const, gap: 28, marginTop: 36 },
  stepRow: { display: 'flex', gap: 22, alignItems: 'flex-start' },
  stepNum: {
    fontSize: 13,
    fontWeight: 900,
    color: '#5c7a1f',
    background: 'rgba(178,242,77,0.22)',
    borderRadius: '50%',
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepTitle: { fontSize: 16, fontWeight: 800, color: '#0a1120', marginBottom: 4 },
  stepBody: { fontSize: 14, color: '#4a5a7e', lineHeight: 1.6, maxWidth: 560 },
  deliverableGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px 32px',
    marginTop: 28,
  },
  deliverableRow: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#1a2540', fontWeight: 600 },
  checkMark: {
    color: '#5c7a1f',
    background: 'rgba(178,242,77,0.25)',
    borderRadius: '50%',
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 900,
    flexShrink: 0,
  },
  sectorRow: { display: 'flex', gap: 12, flexWrap: 'wrap' as const, marginTop: 18 },
  sectorChip: {
    background: '#ffffff',
    border: '1px solid #d7dbe6',
    borderRadius: 24,
    padding: '10px 20px',
    fontSize: 13,
    fontWeight: 700,
    color: '#0a1120',
  },
  finalCta: { background: '#0a1120', padding: '80px 24px', textAlign: 'center' as const },
  finalCtaTitle: { fontSize: 28, fontWeight: 800, color: '#ffffff', margin: '0 0 28px', letterSpacing: -0.5 },
  footer: { padding: '32px 24px', borderTop: '1px solid #eceef3' },
  footerRow: { display: 'flex', alignItems: 'center', gap: 12 },
  footerLogo: { fontSize: 13, fontWeight: 900, letterSpacing: 2, color: '#0a1120' },
  footerTag: { fontSize: 12, color: '#7a8bab' },
};

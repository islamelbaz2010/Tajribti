import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Company Login visual consistency (2026-09-02): previously a dark
// admin-tool panel (#070c1a/#0a1120) with unconditionally prefilled demo
// credentials and a visible "DEMO" badge — inconsistent with the public
// marketing site's light identity (apps/dashboard/src/pages/public/Home.tsx:
// white surface, #0a1120 deep-navy text, #4a5a7e muted, #b2f24d brand lime)
// that a real prospective Company sees first, and a real production-facing
// exposure of working test credentials. Restyled to the exact public-site
// palette; the prefill/badge now only render when NODE_ENV !== 'production'
// (react-scripts sets this automatically on `npm run build`, so the real
// Vercel production build never shows them — no new env var, no manual
// action — while `npm start` keeps the existing fast local/demo login).
// Auth logic, JWT/session handling, and post-login routing are unchanged.
const isDemoBuild = process.env.NODE_ENV !== 'production';

// Founder ruling W-1 (2026-09-02): this page now serves two distinct
// account types — the Company owner's own BrandAccount login (unchanged)
// and an authenticated Company Employee login (new) — via a simple mode
// toggle, not two separate pages, since both land on the exact same
// Company Console. Admin has its own separate login at /admin/login
// (Founder ruling W-2) — deliberately not offered here, to keep the two
// identities from ever being confused on one screen.
export default function Login() {
  const { login, loginEmployee } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'owner' | 'employee'>('owner');
  const [email, setEmail] = useState(isDemoBuild ? 'demo@brand.com' : '');
  const [password, setPassword] = useState(isDemoBuild ? 'Demo1234!' : '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = (next: 'owner' | 'employee') => {
    setMode(next);
    setError('');
    setEmail(next === 'owner' && isDemoBuild ? 'demo@brand.com' : '');
    setPassword(next === 'owner' && isDemoBuild ? 'Demo1234!' : '');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'owner') await login(email, password);
      else await loginEmployee(email, password);
      navigate('/overview');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.panel}>
        <div style={styles.logoRow}>
          <span style={styles.logoText}>TAJRIBTI</span>
          {isDemoBuild && mode === 'owner' && <span style={styles.demoBadge}>DEMO</span>}
        </div>
        <div style={styles.tagline}>{mode === 'owner' ? 'Company Login' : 'Employee Login'}</div>

        <div style={styles.modeToggle}>
          <button
            type="button"
            style={{ ...styles.modeBtn, ...(mode === 'owner' ? styles.modeBtnActive : {}) }}
            onClick={() => switchMode('owner')}
          >
            Company Owner
          </button>
          <button
            type="button"
            style={{ ...styles.modeBtn, ...(mode === 'employee' ? styles.modeBtnActive : {}) }}
            onClick={() => switchMode('employee')}
          >
            Employee
          </button>
        </div>

        <div style={styles.concept}>
          {['TRIAL', 'SIGNAL', 'INTELLIGENCE', 'DECISION'].map((step, i, arr) => (
            <React.Fragment key={step}>
              <span style={styles.conceptStep}>{step}</span>
              {i < arr.length - 1 && <span style={styles.arrow}>→</span>}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              autoFocus
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        {isDemoBuild && mode === 'owner' && <p style={styles.hint}>Demo credentials are pre-filled.</p>}
        {mode === 'employee' && (
          <p style={styles.hint}>
            New here? <Link to="/employee/signup" style={styles.link}>Register with your Company's employee code →</Link>
          </p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #fbfdf6 0%, #ffffff 60%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: 24,
  },
  panel: {
    background: '#ffffff',
    border: '1px solid #e8ecf3',
    borderRadius: 16,
    boxShadow: '0 20px 50px -20px rgba(10,17,32,0.15)',
    padding: '48px 44px',
    width: '100%',
    maxWidth: 400,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 900,
    color: '#0a1120',
    letterSpacing: 3,
  },
  demoBadge: {
    fontSize: 9,
    fontWeight: 800,
    color: '#0a1120',
    background: '#b2f24d',
    borderRadius: 3,
    padding: '2px 8px',
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 12,
    color: '#7a8bab',
    marginBottom: 16,
    fontWeight: 600,
  },
  modeToggle: {
    display: 'flex',
    background: '#f7f8fb',
    border: '1px solid #e8ecf3',
    borderRadius: 8,
    padding: 3,
    marginBottom: 24,
  },
  modeBtn: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    borderRadius: 6,
    padding: '8px 10px',
    fontSize: 12,
    fontWeight: 700,
    color: '#7a8bab',
    cursor: 'pointer',
  },
  modeBtnActive: {
    background: '#ffffff',
    color: '#0a1120',
    boxShadow: '0 1px 3px rgba(10,17,32,0.1)',
  },
  link: {
    color: '#5c7a1f',
    fontWeight: 700,
    textDecoration: 'none',
  },
  concept: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 36,
    flexWrap: 'wrap' as const,
  },
  conceptStep: {
    fontSize: 9,
    fontWeight: 800,
    color: '#5c7a1f',
    letterSpacing: 1.5,
  },
  arrow: {
    color: '#c7d0e0',
    fontSize: 12,
    fontWeight: 700,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: '#4a5a7e',
    letterSpacing: 0.5,
  },
  input: {
    background: '#f7f8fb',
    border: '1px solid #dde3ee',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    color: '#0a1120',
    outline: 'none',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  error: {
    fontSize: 12,
    color: '#b91c1c',
    background: 'rgba(185, 28, 28, 0.06)',
    border: '1px solid rgba(185, 28, 28, 0.18)',
    borderRadius: 6,
    padding: '8px 12px',
    margin: 0,
  },
  btn: {
    background: '#b2f24d',
    color: '#0a1120',
    border: 'none',
    borderRadius: 8,
    padding: '12px 24px',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  hint: {
    textAlign: 'center' as const,
    fontSize: 11,
    color: '#a8b3c9',
    marginTop: 20,
    marginBottom: 0,
  },
};

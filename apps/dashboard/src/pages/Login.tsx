import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@brand.com');
  const [password, setPassword] = useState('Demo1234!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/overview');
    } catch {
      setError('Invalid credentials. Check API connection and seed status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.panel}>
        <div style={styles.logoRow}>
          <span style={styles.logoText}>TAJRIBTI</span>
          <span style={styles.demoBadge}>DEMO</span>
        </div>
        <div style={styles.tagline}>Consumer Intelligence Platform</div>

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

        <p style={styles.hint}>Demo credentials are pre-filled.</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: '#070c1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: 24,
  },
  panel: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 16,
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
    color: '#edf0ff',
    letterSpacing: 3,
  },
  demoBadge: {
    fontSize: 9,
    fontWeight: 800,
    color: '#040812',
    background: '#b2f24d',
    borderRadius: 3,
    padding: '2px 8px',
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 12,
    color: '#2e3d5e',
    marginBottom: 28,
    fontWeight: 500,
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
    color: '#b2f24d',
    letterSpacing: 1.5,
  },
  arrow: {
    color: '#1a2540',
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
    fontWeight: 600,
    color: '#2e3d5e',
    letterSpacing: 0.5,
  },
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
  error: {
    fontSize: 12,
    color: '#fb7185',
    background: 'rgba(251, 113, 133, 0.08)',
    border: '1px solid rgba(251, 113, 133, 0.2)',
    borderRadius: 6,
    padding: '8px 12px',
    margin: 0,
  },
  btn: {
    background: '#b2f24d',
    color: '#040812',
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
    color: '#1a2540',
    marginTop: 20,
    marginBottom: 0,
  },
};

import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

// Founder ruling W-2 (2026-09-02): a real authenticated Admin identity —
// replaces sole reliance on the x-admin-secret header as the product's
// final Admin model. Deliberately a separate page/route from /login (the
// Company/Employee login) — the two identities never share a screen.
export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin/companies');
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
        </div>
        <div style={styles.tagline}>Admin Control Center</div>

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
        <p style={styles.hint}>
          No account yet? An existing Admin can create one via POST /admin/auth/bootstrap.
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: '#0a1120',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: 24,
  },
  panel: {
    background: '#111a2e',
    border: '1px solid #253048',
    borderRadius: 16,
    boxShadow: '0 20px 50px -20px rgba(0,0,0,0.5)',
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
    color: '#ffffff',
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 12,
    color: '#b2f24d',
    marginBottom: 28,
    fontWeight: 700,
    letterSpacing: 1,
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
    color: '#a8b3c9',
    letterSpacing: 0.5,
  },
  input: {
    background: '#0a1120',
    border: '1px solid #253048',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    color: '#ffffff',
    outline: 'none',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  error: {
    fontSize: 12,
    color: '#fca5a5',
    background: 'rgba(220, 38, 38, 0.12)',
    border: '1px solid rgba(220, 38, 38, 0.3)',
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
    color: '#5c6b8a',
    marginTop: 20,
    marginBottom: 0,
  },
};

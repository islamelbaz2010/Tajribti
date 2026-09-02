import React, { useEffect, useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/endpoints';
import type { EmployeeSignupCompany } from '../api/types';

// Founder ruling W-1 (2026-09-02): "A person wanting company affiliation
// selects an existing real Company... Employee registration may require a
// Company-specific code... Wrong code blocks registration and tells the
// person to obtain the code." This page is that path — deliberately
// separate from ordinary Consumer signup (no Company selection there) and
// from the Company owner's own /login.
export default function EmployeeSignup() {
  const { applyTokens } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<EmployeeSignupCompany[]>([]);
  const [companyId, setCompanyId] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authApi.listCompaniesForEmployeeSignup().then(setCompanies).catch(() => setCompanies([]));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!companyId) {
      setError('Select the Company you work for.');
      return;
    }
    setLoading(true);
    try {
      const result = await authApi.employeeSignup({ companyId, code, name, email, password });
      applyTokens(result.accessToken, result.refreshToken);
      navigate('/overview');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed — check your Company and code and try again.';
      setError(message);
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
        <div style={styles.tagline}>Register as a Company Employee</div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Your Company</label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              style={styles.input}
              required
            >
              <option value="">Select your Company…</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Company Employee Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={styles.input}
              placeholder="Ask your Company admin for this"
              required
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              minLength={8}
              required
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Registering…' : 'Register →'}
          </button>
        </form>

        <p style={styles.hint}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in →</Link>
        </p>
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
    padding: '44px 40px',
    width: '100%',
    maxWidth: 420,
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
  tagline: {
    fontSize: 12,
    color: '#7a8bab',
    marginBottom: 24,
    fontWeight: 600,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
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
  link: {
    color: '#5c7a1f',
    fontWeight: 700,
    textDecoration: 'none',
  },
};

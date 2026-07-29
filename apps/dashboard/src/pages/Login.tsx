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
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.logo}>Tajribti</span>
          <p style={styles.subtitle}>Brand Intelligence Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
            autoFocus
          />
          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p style={styles.hint}>Demo: demo@brand.com / Demo1234!</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1a1a2e',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '48px 40px',
    width: 380,
    boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
  },
  header: { textAlign: 'center', marginBottom: 32 },
  logo: {
    fontSize: 32,
    fontWeight: 800,
    color: '#1a1a2e',
    display: 'block',
    marginBottom: 8,
  },
  subtitle: { color: '#666', fontSize: 14, margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: '#333' },
  input: {
    border: '1.5px solid #e0e0e0',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 14,
    outline: 'none',
    marginBottom: 8,
  },
  error: { color: '#e94560', fontSize: 13, margin: '4px 0' },
  btn: {
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 8,
  },
  hint: { textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 20, marginBottom: 0 },
};

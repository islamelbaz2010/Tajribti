import React, { useEffect, useState } from 'react';
import { companyApi, employeesApi } from '../api/endpoints';
import type { Company, CompanyEmployee } from '../api/types';

// Founder ruling W-1 (2026-09-02): self-service view of who currently has
// authenticated employee access to this Company, plus the code new
// employees need to register themselves at /employee/signup. Creating a
// new employee directly (as opposed to self-registration) stays
// Admin-only per the Founder's own requirement ("Admin may create
// employee accounts when the Company requests them") — this page can
// view and revoke, not create.
export default function Employees() {
  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<CompanyEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([companyApi.getMe(), employeesApi.list()])
      .then(([c, list]) => {
        setCompany(c);
        setEmployees(list);
      })
      .catch(() => setError('Failed to load employees.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRemove = (id: string) => {
    if (!window.confirm('Revoke this employee\'s access? They will no longer be able to sign in.')) return;
    employeesApi.remove(id).then(() => setEmployees((prev) => prev.filter((e) => e.id !== id)));
  };

  const handleCopyCode = () => {
    if (!company?.employeeCode) return;
    navigator.clipboard?.writeText(company.employeeCode).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 1500);
    });
  };

  if (loading) return <div style={styles.muted}>Loading employees…</div>;
  if (error) return <div style={styles.errMsg}>{error}</div>;

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <h1 style={styles.title}>Company Employees</h1>
        <p style={styles.sub}>
          Real, authenticated TAJRIBTI accounts scoped to your Company — not campaign contacts.
        </p>
      </div>

      <div style={styles.codeCard}>
        <div style={styles.cardTitle}>Employee Registration Code</div>
        <p style={styles.hint}>
          Share this code with people who should have access. They register at{' '}
          <strong>Employee Login → Register</strong>, select your Company, and enter this code.
          {' '}Need a new code? Ask TAJRIBTI Admin to regenerate it.
        </p>
        {company?.employeeCode ? (
          <div style={styles.codeRow}>
            <span style={styles.codeValue}>{company.employeeCode}</span>
            <button style={styles.copyBtn} onClick={handleCopyCode}>
              {codeCopied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
        ) : (
          <p style={styles.hint}>
            No employee code set yet — ask TAJRIBTI Admin to enable employee registration for your Company.
          </p>
        )}
      </div>

      <div style={styles.listCard}>
        <div style={styles.cardTitle}>Active Employees ({employees.length})</div>
        {employees.length === 0 && <p style={styles.hint}>No employees have registered yet.</p>}
        <div style={styles.employeeList}>
          {employees.map((e) => (
            <div key={e.id} style={styles.employeeRow}>
              <div>
                <div style={styles.employeeName}>{e.name}</div>
                <div style={styles.employeeEmail}>{e.email}</div>
              </div>
              <button style={styles.removeBtn} onClick={() => handleRemove(e.id)}>
                Revoke Access
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { maxWidth: 720 },
  muted: { color: '#7a8bab', fontSize: 14, marginTop: 32 },
  errMsg: { color: '#dc2626', fontSize: 14, marginTop: 32 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 800, color: '#0a1120', margin: '0 0 6px', letterSpacing: -0.3 },
  sub: { fontSize: 13, color: '#4a5a7e', margin: 0, lineHeight: 1.5 },
  codeCard: {
    background: '#ffffff',
    border: '1px solid #e8ecf3',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 14, fontWeight: 800, color: '#0a1120', marginBottom: 8 },
  hint: { fontSize: 12, color: '#7a8bab', lineHeight: 1.6, margin: '0 0 14px' },
  codeRow: { display: 'flex', alignItems: 'center', gap: 10 },
  codeValue: {
    fontFamily: "'SF Mono', 'Menlo', monospace",
    fontSize: 20,
    fontWeight: 800,
    color: '#0a1120',
    background: '#f7f8fb',
    border: '1px solid #dde3ee',
    borderRadius: 8,
    padding: '10px 16px',
    letterSpacing: 2,
  },
  copyBtn: {
    background: 'rgba(178, 242, 77, 0.1)',
    border: '1px solid rgba(178, 242, 77, 0.3)',
    color: '#5c7a1f',
    borderRadius: 8,
    padding: '10px 16px',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
  },
  listCard: {
    background: '#ffffff',
    border: '1px solid #e8ecf3',
    borderRadius: 16,
    padding: 24,
  },
  employeeList: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 },
  employeeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    background: '#f7f8fb',
    borderRadius: 10,
    border: '1px solid #eef1f7',
  },
  employeeName: { fontSize: 13, fontWeight: 700, color: '#0a1120' },
  employeeEmail: { fontSize: 12, color: '#7a8bab', marginTop: 2 },
  removeBtn: {
    background: 'transparent',
    border: '1px solid #f3d0d0',
    color: '#dc2626',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
  },
};

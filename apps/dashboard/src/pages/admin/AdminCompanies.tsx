import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminCompaniesApi } from '../../api/adminEndpoints';
import type { AdminCompany } from '../../api/types';
import { SECTOR_LABELS } from '../../api/types';

// Founder ruling W-2 (2026-09-02): "Admin -> Company" — the first step of
// the required navigation. Company creation stays on the existing
// x-admin-secret-gated POST /admin/brands surface (curl/operator tooling)
// per this task's own "Companies are created ONLY by TAJRIBTI Admin after
// a real client meeting" — deliberately not a one-click "+ New Company"
// button here, to avoid making Company provisioning feel like a casual
// self-service action.
export default function AdminCompanies() {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminCompaniesApi
      .list()
      .then(setCompanies)
      .catch(() => setError('Failed to load companies.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <div style={styles.muted}>Loading companies…</div>;
  if (error) return <div style={styles.errMsg}>{error}</div>;

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <h1 style={styles.title}>Companies</h1>
        <p style={styles.sub}>Every Company on TAJRIBTI — {companies.length} total.</p>
      </div>

      <input
        style={styles.search}
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Sector</th>
              <th style={styles.th}>Employees</th>
              <th style={styles.th}>Campaigns</th>
              <th style={styles.th}>Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td style={styles.td}>
                  <Link to={`/admin/companies/${c.id}`} style={styles.companyLink}>
                    {c.name}
                  </Link>
                  <div style={styles.companyEmail}>{c.email}</div>
                </td>
                <td style={styles.td}>{c.sector ? SECTOR_LABELS[c.sector] : '—'}</td>
                <td style={styles.td}>{c.employeeCount}</td>
                <td style={styles.td}>{c.campaignCount}</td>
                <td style={styles.td}>{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td style={styles.td} colSpan={5}>No companies match your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { maxWidth: 960 },
  muted: { color: '#7a8bab', fontSize: 14 },
  errMsg: { color: '#dc2626', fontSize: 14 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 800, color: '#0a1120', margin: '0 0 6px', letterSpacing: -0.3 },
  sub: { fontSize: 13, color: '#4a5a7e', margin: 0 },
  search: {
    background: '#ffffff',
    border: '1px solid #e8ecf3',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    width: 320,
    marginBottom: 16,
    outline: 'none',
  },
  tableWrap: {
    background: '#ffffff',
    border: '1px solid #e8ecf3',
    borderRadius: 14,
    overflow: 'auto',
  },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: {
    textAlign: 'left' as const,
    fontSize: 10,
    fontWeight: 800,
    color: '#7a8bab',
    letterSpacing: 0.5,
    padding: '12px 16px',
    borderBottom: '1px solid #e8ecf3',
    textTransform: 'uppercase' as const,
  },
  td: {
    padding: '14px 16px',
    fontSize: 13,
    color: '#0a1120',
    borderBottom: '1px solid #f1f4f9',
    verticalAlign: 'top' as const,
  },
  companyLink: { color: '#0a1120', fontWeight: 700, textDecoration: 'none' },
  companyEmail: { fontSize: 11, color: '#7a8bab', marginTop: 2 },
};

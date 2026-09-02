import React, { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { adminCompaniesApi } from '../../api/adminEndpoints';
import type { AdminCompany, BrandSector } from '../../api/types';
import { SECTOR_LABELS } from '../../api/types';

// Product Completion Wave (2026-09-02): "Admin -> Company" — the first
// step of the required navigation, now with the actual Company-creation
// OPERATION exposed here (previously API-only). This does not weaken
// "Companies are created ONLY by TAJRIBTI Admin after a real client
// meeting + commercial agreement" — the operation is still gated behind
// real Admin authentication (or the legacy secret), never public; a form
// behind that gate is the same operation as the equivalent curl call,
// just usable without a terminal. Reuses POST /admin/brands unchanged —
// no new backend capability.
export default function AdminCompanies() {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sector, setSector] = useState<BrandSector | ''>('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const load = () => {
    setLoading(true);
    adminCompaniesApi
      .list()
      .then(setCompanies)
      .catch(() => setError('Failed to load companies.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 8) return;
    setCreating(true);
    setCreateError('');
    adminCompaniesApi
      .create({ name: name.trim(), email: email.trim(), password, sector: sector || undefined })
      .then(() => {
        setName(''); setEmail(''); setPassword(''); setSector(''); setShowCreate(false);
        load();
      })
      .catch((err) => {
        setCreateError(err?.response?.data?.message ? String(err.response.data.message) : 'Could not create company.');
      })
      .finally(() => setCreating(false));
  };

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <div style={styles.muted}>Loading companies…</div>;
  if (error) return <div style={styles.errMsg}>{error}</div>;

  return (
    <div style={styles.root}>
      <div style={styles.headerRow}>
        <div style={styles.header}>
          <h1 style={styles.title}>Companies</h1>
          <p style={styles.sub}>Every Company on TAJRIBTI — {companies.length} total.</p>
        </div>
        <button style={styles.newBtn} onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? 'Cancel' : '+ New Company'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} style={styles.createCard}>
          <div style={styles.createGrid}>
            <input style={styles.input} placeholder="Company name" value={name} onChange={(e) => setName(e.target.value)} />
            <input style={styles.input} placeholder="Login email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input style={styles.input} placeholder="Password (min 8 chars)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <select style={styles.input} value={sector} onChange={(e) => setSector(e.target.value as BrandSector | '')}>
              <option value="">Sector (optional)</option>
              {Object.entries(SECTOR_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          {createError && <p style={styles.createError}>{createError}</p>}
          <button type="submit" style={styles.createBtn} disabled={creating}>
            {creating ? 'Creating…' : 'Create Company'}
          </button>
          <p style={styles.createHint}>
            An employee registration code is generated automatically — view it on the Company's own page after creation.
          </p>
        </form>
      )}

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
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  header: {},
  title: { fontSize: 24, fontWeight: 800, color: '#0a1120', margin: '0 0 6px', letterSpacing: -0.3 },
  sub: { fontSize: 13, color: '#4a5a7e', margin: 0 },
  newBtn: {
    background: '#0a1120', color: '#ffffff', border: 'none', borderRadius: 8,
    padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' as const,
  },
  createCard: {
    background: '#ffffff', border: '1px solid #e8ecf3', borderRadius: 14, padding: 20, marginBottom: 16,
  },
  createGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 },
  input: {
    background: '#f7f8fb', border: '1px solid #dde3ee', borderRadius: 8, padding: '9px 12px',
    fontSize: 13, color: '#0a1120', outline: 'none',
  },
  createError: { fontSize: 12, color: '#dc2626', margin: '0 0 10px' },
  createBtn: {
    background: '#b2f24d', color: '#0a1120', border: 'none', borderRadius: 8, padding: '10px 18px',
    fontSize: 13, fontWeight: 800, cursor: 'pointer',
  },
  createHint: { fontSize: 11, color: '#a8b3c9', margin: '10px 0 0' },
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

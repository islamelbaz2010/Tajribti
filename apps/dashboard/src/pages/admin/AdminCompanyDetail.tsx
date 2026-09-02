import React, { useEffect, useState, FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminCompaniesApi, adminCampaignsApi } from '../../api/adminEndpoints';
import type { AdminCompany, CompanyEmployee, AdminCampaign, BrandSector } from '../../api/types';
import { SECTOR_LABELS } from '../../api/types';

const STATUS_COLOR: Record<string, string> = {
  active: '#16a34a',
  draft: '#6b7fa8',
  paused: '#d97706',
  completed: '#2563eb',
  archived: '#4a5a7e',
};

// Founder ruling W-2 (2026-09-02): "Admin -> Company -> Company Overview
// -> Company Employees -> Company Campaigns" drill-down. Founder ruling
// W-1: "Admin may create employee accounts when the Company requests
// them" — the create-employee form lives here.
export default function AdminCompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<AdminCompany | null>(null);
  const [employees, setEmployees] = useState<CompanyEmployee[]>([]);
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  // Product Completion Wave (2026-09-02): the Company-record edit
  // operation — PATCH /admin/brands/:id already existed on the API
  // (unchanged), this UI form was the missing piece. Only the fields the
  // API already accepts (name/sector/logoUrl); no new Company fields.
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSector, setEditSector] = useState<BrandSector | ''>('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  const load = () => {
    if (!id) return;
    setLoading(true);
    setError('');
    Promise.all([
      adminCompaniesApi.get(id),
      adminCompaniesApi.listEmployees(id),
      adminCampaignsApi.list({ brandId: id, limit: 100 }),
    ])
      .then(([c, emps, camps]) => {
        setCompany(c);
        setEmployees(emps);
        setCampaigns(camps.campaigns);
        setEditName(c.name);
        setEditSector(c.sector ?? '');
      })
      .catch(() => setError('Failed to load company.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!id || !editName.trim()) return;
    setSavingEdit(true);
    setEditError('');
    adminCompaniesApi
      .update(id, { name: editName.trim(), sector: editSector || undefined })
      .then((updated) => {
        setCompany((prev) => (prev ? { ...prev, ...updated } : prev));
        setEditing(false);
      })
      .catch((err) => {
        setEditError(err?.response?.data?.message ? String(err.response.data.message) : 'Could not save changes.');
      })
      .finally(() => setSavingEdit(false));
  };

  const handleCreateEmployee = (e: FormEvent) => {
    e.preventDefault();
    if (!id || !empName.trim() || !empEmail.trim() || empPassword.length < 8) return;
    setCreating(true);
    setCreateError('');
    adminCompaniesApi
      .createEmployee(id, { name: empName.trim(), email: empEmail.trim(), password: empPassword })
      .then((emp) => {
        setEmployees((prev) => [emp, ...prev]);
        setEmpName('');
        setEmpEmail('');
        setEmpPassword('');
      })
      .catch((err) => {
        setCreateError(err?.response?.data?.message ? String(err.response.data.message) : 'Could not create employee.');
      })
      .finally(() => setCreating(false));
  };

  const handleRemoveEmployee = (employeeId: string) => {
    if (!id) return;
    if (!window.confirm('Revoke this employee\'s access?')) return;
    adminCompaniesApi.removeEmployee(id, employeeId).then(() =>
      setEmployees((prev) => prev.filter((e) => e.id !== employeeId)),
    );
  };

  const handleRegenerateCode = () => {
    if (!id) return;
    if (!window.confirm('Regenerate the employee code? The old code will stop working immediately.')) return;
    setRegenerating(true);
    adminCompaniesApi
      .regenerateEmployeeCode(id)
      .then(({ employeeCode }) => setCompany((prev) => (prev ? { ...prev, employeeCode } : prev)))
      .finally(() => setRegenerating(false));
  };

  if (loading) return <div style={styles.muted}>Loading company…</div>;
  if (error) return <div style={styles.errMsg}>{error}</div>;
  if (!company) return null;

  return (
    <div style={styles.root}>
      <Link to="/admin/companies" style={styles.backLink}>← All Companies</Link>

      <div style={styles.header}>
        {company.logoUrl ? (
          <img src={company.logoUrl} alt={company.name} style={styles.logo} />
        ) : (
          <div style={styles.logoPlaceholder}>{company.name.charAt(0).toUpperCase()}</div>
        )}
        <div style={{ flex: 1 }}>
          <h1 style={styles.title}>{company.name}</h1>
          <p style={styles.sub}>
            {company.email} · {company.sector ? SECTOR_LABELS[company.sector] : 'Sector not set'} · Joined{' '}
            {new Date(company.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button style={styles.smallBtn} onClick={() => setEditing((v) => !v)}>
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSaveEdit} style={styles.editCard}>
          <div style={styles.editGrid}>
            <input style={styles.input} placeholder="Company name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <select style={styles.input} value={editSector} onChange={(e) => setEditSector(e.target.value as BrandSector | '')}>
              <option value="">Sector (not set)</option>
              {Object.entries(SECTOR_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          {/* Product Reference Alignment (2026-09-02), Phase 14: logo is
              deliberately NOT editable here as a raw URL field anymore —
              the Company already has a correct, working upload mechanism
              (CompanyProfile.tsx's own Upload/Change/Remove Logo, backed
              by the existing Postgres-asset-store AssetsController) that
              this admin edit form should not bypass with an unvalidated
              text field. No new upload infrastructure was introduced for
              Admin specifically, per this task's own instruction. */}
          {editError && <p style={styles.error}>{editError}</p>}
          <button type="submit" style={styles.addBtn} disabled={savingEdit}>
            {savingEdit ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Employee Registration Code</div>
          <div style={styles.codeRow}>
            <span style={styles.codeValue}>{company.employeeCode ?? 'Not set'}</span>
            <button style={styles.smallBtn} onClick={handleRegenerateCode} disabled={regenerating}>
              {regenerating ? '…' : 'Regenerate'}
            </button>
          </div>

          <div style={styles.cardTitle}>Employees ({employees.length})</div>
          <form onSubmit={handleCreateEmployee} style={styles.addForm}>
            <input style={styles.input} placeholder="Name" value={empName} onChange={(e) => setEmpName(e.target.value)} />
            <input style={styles.input} placeholder="Email" type="email" value={empEmail} onChange={(e) => setEmpEmail(e.target.value)} />
            <input style={styles.input} placeholder="Password (min 8 chars)" type="password" value={empPassword} onChange={(e) => setEmpPassword(e.target.value)} />
            <button type="submit" style={styles.addBtn} disabled={creating}>
              {creating ? 'Creating…' : '+ Create Employee'}
            </button>
          </form>
          {createError && <p style={styles.error}>{createError}</p>}

          <div style={styles.employeeList}>
            {employees.length === 0 && <p style={styles.hint}>No employees yet.</p>}
            {employees.map((emp) => (
              <div key={emp.id} style={styles.employeeRow}>
                <div>
                  <div style={styles.employeeName}>{emp.name}</div>
                  <div style={styles.employeeEmail}>{emp.email}</div>
                </div>
                <button style={styles.removeBtn} onClick={() => handleRemoveEmployee(emp.id)}>Revoke</button>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Campaigns ({campaigns.length})</div>
          <div style={styles.campaignList}>
            {campaigns.length === 0 && <p style={styles.hint}>No campaigns yet.</p>}
            {campaigns.map((camp) => (
              <Link key={camp.id} to={`/admin/campaigns/${camp.id}`} style={styles.campaignRow}>
                <div>
                  <div style={styles.campaignName}>{camp.productName}</div>
                  <div style={styles.campaignMeta}>{new Date(camp.createdAt).toLocaleDateString()}</div>
                </div>
                <span
                  style={{
                    ...styles.statusPill,
                    color: STATUS_COLOR[camp.status] ?? '#4a5a7e',
                    borderColor: `${STATUS_COLOR[camp.status] ?? '#4a5a7e'}55`,
                  }}
                >
                  {camp.status.toUpperCase()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { maxWidth: 1000 },
  muted: { color: '#7a8bab', fontSize: 14 },
  errMsg: { color: '#dc2626', fontSize: 14 },
  backLink: { fontSize: 12, color: '#7a8bab', textDecoration: 'none', fontWeight: 600 },
  header: { display: 'flex', alignItems: 'center', gap: 16, margin: '16px 0 24px' },
  logo: { width: 56, height: 56, borderRadius: 12, objectFit: 'cover' as const, border: '1px solid #dde3ee' },
  logoPlaceholder: {
    width: 56, height: 56, borderRadius: 12, background: '#f0f4fa', color: '#b2f24d',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800,
  },
  title: { fontSize: 22, fontWeight: 800, color: '#0a1120', margin: '0 0 4px', letterSpacing: -0.3 },
  sub: { fontSize: 12, color: '#7a8bab', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  card: { background: '#ffffff', border: '1px solid #e8ecf3', borderRadius: 16, padding: 24 },
  cardTitle: { fontSize: 13, fontWeight: 800, color: '#0a1120', margin: '0 0 10px' },
  codeRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 },
  codeValue: {
    fontFamily: "'SF Mono', 'Menlo', monospace", fontSize: 16, fontWeight: 800, color: '#0a1120',
    background: '#f7f8fb', border: '1px solid #dde3ee', borderRadius: 8, padding: '8px 14px', letterSpacing: 1.5,
  },
  smallBtn: {
    background: 'transparent', border: '1px solid #dde3ee', color: '#374151', borderRadius: 8,
    padding: '8px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
  },
  editCard: { background: '#ffffff', border: '1px solid #e8ecf3', borderRadius: 14, padding: 20, marginBottom: 20 },
  editGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 },
  addForm: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 },
  input: {
    background: '#f7f8fb', border: '1px solid #dde3ee', borderRadius: 8, padding: '9px 12px',
    fontSize: 12, color: '#0a1120', outline: 'none',
  },
  addBtn: {
    background: '#b2f24d', color: '#0a1120', border: 'none', borderRadius: 8, padding: '9px 12px',
    fontSize: 12, fontWeight: 800, cursor: 'pointer',
  },
  error: { fontSize: 11, color: '#dc2626', margin: '0 0 10px' },
  hint: { fontSize: 12, color: '#a8b3c9' },
  employeeList: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 },
  employeeRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px',
    background: '#f7f8fb', borderRadius: 8, border: '1px solid #eef1f7',
  },
  employeeName: { fontSize: 12, fontWeight: 700, color: '#0a1120' },
  employeeEmail: { fontSize: 11, color: '#7a8bab' },
  removeBtn: {
    background: 'transparent', border: '1px solid #f3d0d0', color: '#dc2626', borderRadius: 6,
    padding: '5px 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
  },
  campaignList: { display: 'flex', flexDirection: 'column', gap: 8 },
  campaignRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px',
    background: '#f7f8fb', borderRadius: 10, border: '1px solid #eef1f7', textDecoration: 'none',
  },
  campaignName: { fontSize: 13, fontWeight: 700, color: '#0a1120' },
  campaignMeta: { fontSize: 11, color: '#7a8bab', marginTop: 2 },
  statusPill: { fontSize: 9, fontWeight: 800, border: '1px solid', borderRadius: 4, padding: '3px 8px', letterSpacing: 0.5 },
};

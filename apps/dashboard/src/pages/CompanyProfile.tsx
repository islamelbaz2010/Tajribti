import React, { useEffect, useState, FormEvent } from 'react';
import { companyApi } from '../api/endpoints';
import type { Company, BrandContact } from '../api/types';
import { SECTOR_LABELS } from '../api/types';

// Company Foundation (2026-09-01): "who am I" for the authenticated
// Company — identity (name/email/logo/sector, Admin-provisioned) plus
// self-service management of the Company's own campaign contacts. All
// data is server-scoped to the authenticated brand (GET/POST/DELETE
// /company/*) — never filtered client-side.
export default function CompanyProfile() {
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<BrandContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([companyApi.getMe(), companyApi.getContacts()])
      .then(([c, list]) => {
        setCompany(c);
        setContacts(list);
      })
      .catch(() => setError('Failed to load Company profile.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAddContact = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setAdding(true);
    setAddError('');
    companyApi
      .createContact({ name: name.trim(), email: email.trim(), role: role.trim() || undefined })
      .then((contact) => {
        setContacts((prev) => [contact, ...prev]);
        setName('');
        setEmail('');
        setRole('');
      })
      .catch((err) => {
        setAddError(
          err?.response?.data?.message ? String(err.response.data.message) : 'Could not add contact.',
        );
      })
      .finally(() => setAdding(false));
  };

  const handleRemoveContact = (id: string) => {
    if (!window.confirm('Remove this contact? Campaigns currently assigned to them will keep their history, just lose the contact reference.')) return;
    companyApi.removeContact(id).then(() => setContacts((prev) => prev.filter((c) => c.id !== id)));
  };

  if (loading) return <div style={styles.muted}>Loading Company profile…</div>;
  if (error) return <div style={styles.errMsg}>{error}</div>;
  if (!company) return null;

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <h1 style={styles.title}>Company Profile</h1>
        <p style={styles.sub}>Who you are on Tajribti, and who at your company runs campaigns.</p>
      </div>

      <div style={styles.identityCard}>
        <div style={styles.identityRow}>
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={company.name} style={styles.logo} />
          ) : (
            <div style={styles.logoPlaceholder}>{company.name.charAt(0).toUpperCase()}</div>
          )}
          <div>
            <div style={styles.companyName}>{company.name}</div>
            <div style={styles.companyEmail}>{company.email}</div>
          </div>
        </div>
        <div style={styles.sectorRow}>
          <span style={styles.sectorLabel}>Sector</span>
          <span style={styles.sectorValue}>
            {company.sector ? SECTOR_LABELS[company.sector] : 'Not set — contact Tajribti to configure'}
          </span>
        </div>
      </div>

      <div style={styles.contactsCard}>
        <div style={styles.cardTitle}>Campaign Contacts</div>
        <p style={styles.hint}>
          People at your company who can be assigned to a campaign when creating or editing it.
          These are records, not logins — contacts don't get their own Tajribti account.
        </p>

        <form onSubmit={handleAddContact} style={styles.addForm}>
          <input
            style={styles.input}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Role (optional)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <button type="submit" style={styles.addBtn} disabled={adding || !name.trim() || !email.trim()}>
            {adding ? 'Adding…' : '+ Add Contact'}
          </button>
        </form>
        {addError && <p style={styles.error}>{addError}</p>}

        <div style={styles.contactList}>
          {contacts.length === 0 && <p style={styles.hint}>No contacts yet.</p>}
          {contacts.map((c) => (
            <div key={c.id} style={styles.contactRow}>
              <div>
                <div style={styles.contactName}>
                  {c.name}
                  {c.role && <span style={styles.contactRole}> · {c.role}</span>}
                </div>
                <div style={styles.contactEmail}>{c.email}</div>
              </div>
              <button style={styles.removeBtn} onClick={() => handleRemoveContact(c.id)}>
                Remove
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
  muted: { color: '#2e3d5e', fontSize: 14, marginTop: 32 },
  errMsg: { color: '#fb7185', fontSize: 14, marginTop: 32 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 800, color: '#edf0ff', margin: '0 0 6px', letterSpacing: -0.3 },
  sub: { fontSize: 13, color: '#6b7fa8', margin: 0, lineHeight: 1.5 },
  identityCard: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  identityRow: { display: 'flex', alignItems: 'center', gap: 16 },
  logo: { width: 56, height: 56, borderRadius: 12, objectFit: 'cover' as const, border: '1px solid #1a2540' },
  logoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    background: '#111d35',
    color: '#b2f24d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    fontWeight: 800,
  },
  companyName: { fontSize: 17, fontWeight: 800, color: '#edf0ff' },
  companyEmail: { fontSize: 12, color: '#6b7fa8', marginTop: 2 },
  sectorRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 16,
    borderTop: '1px solid #111d35',
  },
  sectorLabel: { fontSize: 11, color: '#2e3d5e', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' as const },
  sectorValue: { fontSize: 13, color: '#c3cbe6', fontWeight: 600 },
  contactsCard: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 16,
    padding: 24,
  },
  cardTitle: { fontSize: 11, fontWeight: 700, color: '#2e3d5e', letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' as const },
  hint: { fontSize: 12, color: '#6b7fa8', margin: '0 0 16px', lineHeight: 1.5 },
  addForm: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10, marginBottom: 8 },
  input: {
    background: '#070c1a',
    border: '1px solid #1a2540',
    borderRadius: 8,
    padding: '9px 12px',
    fontSize: 13,
    color: '#edf0ff',
    outline: 'none',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  addBtn: {
    background: '#b2f24d',
    color: '#040812',
    border: 'none',
    borderRadius: 8,
    padding: '9px 16px',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  error: { fontSize: 12, color: '#fb7185', margin: '4px 0 0' },
  contactList: { display: 'flex', flexDirection: 'column' as const, gap: 8, marginTop: 16 },
  contactRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#070c1a',
    border: '1px solid #111d35',
    borderRadius: 10,
    padding: '10px 14px',
  },
  contactName: { fontSize: 13, fontWeight: 700, color: '#edf0ff' },
  contactRole: { fontSize: 12, fontWeight: 500, color: '#6b7fa8' },
  contactEmail: { fontSize: 11, color: '#6b7fa8', marginTop: 2 },
  removeBtn: {
    background: 'transparent',
    border: '1px solid #1a2540',
    color: '#fb7185',
    borderRadius: 6,
    padding: '5px 10px',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
  },
};

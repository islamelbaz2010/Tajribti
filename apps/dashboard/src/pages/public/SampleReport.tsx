import React from 'react';
import { Link } from 'react-router-dom';
import Report from '../Report';

// Commercial V1 Completion Sprint (2026-09-01): the public marketing
// site's "View Sample Report" destination — reuses the existing,
// proven Report component in `mode="public"` (backed by the new
// GET /report/sample public endpoint, hardcoded server-side to the
// seeded demo campaign — never any real Company's data). A minimal
// public header replaces the authenticated Layout/sidebar chrome; the
// report content itself (cover, sections, download) is unchanged.
export default function PublicSampleReport() {
  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fb' }}>
      <div style={s.header}>
        <div style={s.headerInner}>
          <Link to="/" style={s.logo}>TAJRIBTI</Link>
          <span style={s.badge}>SAMPLE REPORT</span>
          <Link to="/" style={s.backLink}>&larr; Back to tajribti</Link>
        </div>
      </div>
      <Report mode="public" />
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  header: {
    background: '#ffffff',
    borderBottom: '1px solid #eceef3',
  },
  headerInner: {
    maxWidth: 1120,
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  logo: { fontSize: 14, fontWeight: 900, letterSpacing: 2, color: '#0a1120', textDecoration: 'none' },
  badge: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1,
    color: '#5c7a1f',
    background: 'rgba(178,242,77,0.2)',
    borderRadius: 4,
    padding: '3px 8px',
  },
  backLink: { marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: '#4a5a7e', textDecoration: 'none' },
};

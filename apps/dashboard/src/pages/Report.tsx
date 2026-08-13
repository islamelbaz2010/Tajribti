import React, { useEffect, useState, useRef } from 'react';
import { campaignApi, reportApi } from '../api/endpoints';
import type { PdfData } from '../api/types';

export default function Report() {
  const [data, setData] = useState<PdfData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    campaignApi
      .getDemoActive()
      .then((c) => reportApi.getPdfData(c.id))
      .then(setData)
      .catch(() => setError('Failed to load report data.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async () => {
    if (!data || !reportRef.current) return;
    setGenerating(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
      pdf.save(`tajribti-report-${data.campaign.productName.replace(/\s+/g, '-')}.pdf`);
    } catch {
      setError('PDF generation failed. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div style={styles.loading}>Preparing report…</div>;
  if (error) return <div style={styles.error}>{error}</div>;
  if (!data) return null;

  const { campaign, overview, survey, report } = data;

  return (
    <div>
      <div style={styles.actionBar}>
        <div>
          <span style={styles.demoBadge}>REPORT</span>
          <h1 style={styles.title}>Campaign Report</h1>
        </div>
        <button style={styles.downloadBtn} onClick={handleDownload} disabled={generating}>
          {generating ? 'Generating PDF…' : 'Download PDF →'}
        </button>
      </div>

      {/* Dark outer wrapper — reportRef content stays white for PDF */}
      <div style={styles.reportOuter}>
        <div ref={reportRef} style={styles.reportPage}>
          <div style={styles.coverHeader}>
            <div>
              <h2 style={styles.productName}>{campaign.productName}</h2>
              <p style={styles.brandName}>{campaign.brandName}</p>
              <p style={styles.location}>{campaign.locationName}</p>
            </div>
            <div style={styles.coverBadge}>Consumer Intelligence Report</div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Key Metrics</h3>
            <div style={styles.metricsGrid}>
              <Metric label="Redemptions" value={overview.totalRedemptions} />
              <Metric label="Survey Completions" value={overview.surveyCompletions} />
              <Metric label="Completion Rate" value={`${overview.completionRate}%`} />
              <Metric label="Purchase Intent" value={`${overview.purchaseIntentPercent}%`} />
              <Metric label="Intent Score" value={`${survey.purchaseIntentScore}/100`} />
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Intelligence Summary</h3>
            <div style={styles.narrativeBox}>
              {report.narrative.split('\n').map((line, i) => {
                if (!line.trim()) return <br key={i} />;
                return <p key={i} style={styles.narrativeLine}>{line}</p>;
              })}
            </div>
            <p style={styles.narrativeMeta}>
              Based on {report.responseCountAtGeneration} survey responses ·{' '}
              Generated {new Date(report.createdAt).toLocaleDateString('en-EG')}
            </p>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Purchase Intent</h3>
            {survey.purchaseIntentDistribution.map((item) => (
              <div key={item.label} style={styles.barRow}>
                <span style={styles.barLabel}>{item.label}</span>
                <div style={styles.barTrack}>
                  <div style={{ ...styles.barFill, width: `${item.percentage}%` }} />
                </div>
                <span style={styles.barPct}>{item.percentage}%</span>
              </div>
            ))}
          </div>

          <div style={styles.reportFooter}>
            <span>Tajribti · Consumer Intelligence Platform</span>
            <span>CONFIDENTIAL — DEMO</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={metricStyles.card}>
      <span style={metricStyles.value}>{value}</span>
      <span style={metricStyles.label}>{label}</span>
    </div>
  );
}

const metricStyles: Record<string, React.CSSProperties> = {
  card: {
    background: '#f8f9fa',
    borderRadius: 8,
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  value: { fontSize: 28, fontWeight: 800, color: '#1a1a2e' },
  label: { fontSize: 12, color: '#888', fontWeight: 500 },
};

const styles: Record<string, React.CSSProperties> = {
  loading: { color: '#2e3d5e', fontSize: 14, marginTop: 32 },
  error: { color: '#fb7185', fontSize: 14, marginTop: 32 },
  actionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  demoBadge: {
    display: 'inline-block',
    fontSize: 9,
    fontWeight: 800,
    color: '#040812',
    background: '#b2f24d',
    borderRadius: 3,
    padding: '3px 8px',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    color: '#edf0ff',
    margin: '4px 0',
    letterSpacing: -0.3,
  },
  downloadBtn: {
    background: '#b2f24d',
    color: '#040812',
    border: 'none',
    borderRadius: 8,
    padding: '12px 24px',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
    letterSpacing: 0.3,
    marginTop: 12,
  },
  reportOuter: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 16,
    padding: 24,
  },
  /* reportPage stays white — html2canvas captures this for PDF */
  reportPage: {
    background: '#ffffff',
    borderRadius: 8,
    padding: 40,
    maxWidth: 800,
    margin: '0 auto',
  },
  coverHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 24,
    borderBottom: '2px solid #1a1a2e',
    marginBottom: 32,
  },
  productName: { fontSize: 26, fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px' },
  brandName: { fontSize: 16, color: '#555', margin: '0 0 2px' },
  location: { fontSize: 13, color: '#aaa', margin: 0 },
  coverBadge: {
    background: '#1a1a2e',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    alignSelf: 'flex-start',
  },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 16 },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 12,
  },
  narrativeBox: {
    background: '#f9f9f9',
    borderLeft: '4px solid #1a1a2e',
    padding: '20px 24px',
    borderRadius: '0 8px 8px 0',
  },
  narrativeLine: { margin: '0 0 8px', fontSize: 14, color: '#333', lineHeight: 1.7 },
  narrativeMeta: { fontSize: 12, color: '#aaa', marginTop: 12 },
  barRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  barLabel: { width: 100, fontSize: 13, color: '#555' },
  barTrack: { flex: 1, height: 10, background: '#f0f0f0', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', background: '#1a1a2e', borderRadius: 5 },
  barPct: { width: 40, fontSize: 13, fontWeight: 700, color: '#333', textAlign: 'right' as const },
  reportFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTop: '1px solid #eee',
    fontSize: 11,
    color: '#aaa',
  },
};

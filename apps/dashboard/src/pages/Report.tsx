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
      .getMyActiveCampaign()
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

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageWidth = pdf.internal.pageSize.getWidth();   // 210 mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297 mm
      const imgHeightMm = (canvas.height * pageWidth) / canvas.width;

      let remaining = imgHeightMm;
      let yOffset = 0;

      // Slice the captured image across A4 pages
      while (remaining > 0) {
        pdf.addImage(imgData, 'PNG', 0, -yOffset, pageWidth, imgHeightMm);
        remaining -= pageHeight;
        yOffset += pageHeight;
        if (remaining > 0) {
          pdf.addPage();
        }
      }

      const filename = `tajribti-report-${data.campaign.productName.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(filename);
    } catch {
      setError('PDF generation failed. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div style={outer.loading}>Preparing intelligence report…</div>;
  if (error) return <div style={outer.error}>{error}</div>;
  if (!data) return null;

  const { campaign, overview, demographics, survey, report } = data;
  const isDemo = campaign.isDemo;
  const topAge = demographics.ageDistribution[0];
  const topGender = demographics.genderDistribution[0];
  const topCity = demographics.cityDistribution[0];
  const topDescriptor = survey.questionBreakdown['q3']?.[0]?.label ?? null;

  const reportDate = new Date(report.createdAt).toLocaleDateString('en-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div>
      {/* Page header — not captured in PDF */}
      <div style={outer.actionBar}>
        <div>
          {isDemo && <span style={outer.demoBadge}>SAMPLE DATA</span>}
          <h1 style={outer.title}>Campaign Intelligence Report</h1>
          <p style={outer.subtitle}>
            {campaign.brandName} · {campaign.productName}
          </p>
        </div>
        <button style={outer.downloadBtn} onClick={handleDownload} disabled={generating}>
          {generating ? 'Generating PDF…' : 'Download PDF →'}
        </button>
      </div>

      <div style={outer.reportOuter}>
        <div ref={reportRef} style={pg.page}>
          {/* ─── COVER ─── */}
          <div style={pg.coverBlock}>
            <div style={pg.coverTopBar}>
              <div style={pg.tajribtiLogo}>TAJRIBTI</div>
              {isDemo ? (
                <div style={pg.demoBanner}>
                  SAMPLE DATA · For evaluation purposes only
                </div>
              ) : (
                <div style={pg.confidentialBadge}>CONFIDENTIAL</div>
              )}
            </div>
            <div style={pg.coverHero}>
              <div style={pg.reportTypeLabel}>CONSUMER INTELLIGENCE REPORT</div>
              <h1 style={pg.coverProduct}>{campaign.productName}</h1>
              <p style={pg.coverBrand}>{campaign.brandName}</p>
              <div style={pg.coverMetaRow}>
                {campaign.locationName && (
                  <span style={pg.coverMetaChip}>📍 {campaign.locationName}</span>
                )}
                <span style={pg.coverMetaChip}>📅 {reportDate}</span>
                <span style={pg.coverMetaChip}>
                  {overview.surveyCompletions} respondents
                </span>
              </div>
            </div>
            <div style={pg.coverKpis}>
              <div style={pg.coverKpi}>
                <div style={pg.coverKpiNum}>{overview.totalRedemptions}</div>
                <div style={pg.coverKpiLabel}>Verified Participants</div>
              </div>
              <div style={pg.coverKpiDivider} />
              <div style={pg.coverKpi}>
                <div style={pg.coverKpiNum}>{overview.completionRate}%</div>
                <div style={pg.coverKpiLabel}>Completion Rate</div>
              </div>
              <div style={pg.coverKpiDivider} />
              <div style={pg.coverKpi}>
                <div style={{ ...pg.coverKpiNum, color: overview.purchaseIntentPercent >= 50 ? '#166534' : '#92400e' }}>
                  {overview.purchaseIntentPercent}%
                </div>
                <div style={pg.coverKpiLabel}>Purchase Intent</div>
              </div>
            </div>
          </div>

          {/* ─── EXECUTIVE SUMMARY ─── */}
          <ReportSection title="Executive Summary" num="01">
            <div style={pg.narrative}>
              {report.narrative.split('\n').map((line, i) => {
                if (!line.trim()) return <br key={i} />;
                return (
                  <p key={i} style={pg.narrativeLine}>
                    {line}
                  </p>
                );
              })}
            </div>
            <p style={pg.narrativeMeta}>
              Based on {report.responseCountAtGeneration} verified survey responses · Generated{' '}
              {reportDate}
            </p>

            <div style={pg.kpiRow}>
              <KpiCard label="Verified Participants" value={overview.totalRedemptions} />
              <KpiCard
                label="Survey Completion Rate"
                value={`${overview.completionRate}%`}
              />
              <KpiCard
                label="Purchase Intent"
                value={`${overview.purchaseIntentPercent}%`}
                accent
              />
            </div>
          </ReportSection>

          {/* ─── AUDIENCE PROFILE ─── */}
          <ReportSection title="Audience Profile" num="02">
            <p style={pg.sectionIntro}>
              {overview.totalRedemptions} consumers completed a verified physical product trial
              at {campaign.locationName}. All participants authenticated via WhatsApp OTP.
              Demographics reflect self-reported data collected immediately post-trial.
            </p>

            <div style={pg.demoGrid}>
              <div>
                <div style={pg.chartLabel}>Age Distribution</div>
                {demographics.ageDistribution.map((item) => (
                  <CssBar
                    key={item.label}
                    label={item.label}
                    percentage={item.percentage}
                    count={item.count}
                    color="#1a1a2e"
                  />
                ))}
              </div>
              <div>
                <div style={pg.chartLabel}>Gender</div>
                {demographics.genderDistribution.map((item, i) => (
                  <CssBar
                    key={item.label}
                    label={item.label}
                    percentage={item.percentage}
                    count={item.count}
                    color={i === 0 ? '#1a1a2e' : '#6b7fa8'}
                  />
                ))}
              </div>
              <div>
                <div style={pg.chartLabel}>City / District</div>
                {demographics.cityDistribution.slice(0, 5).map((item) => (
                  <CssBar
                    key={item.label}
                    label={item.label}
                    percentage={item.percentage}
                    count={item.count}
                    color="#1a1a2e"
                  />
                ))}
              </div>
            </div>
          </ReportSection>

          {/* ─── PURCHASE INTENT ─── */}
          <ReportSection title="Purchase Intent Analysis" num="03">
            <div style={pg.intentLayout}>
              <div style={pg.intentScoreBox}>
                <div style={pg.intentScoreNum}>{survey.purchaseIntentScore}</div>
                <div style={pg.intentScoreMax}>/100</div>
                <div style={pg.intentScoreLabel}>Intent Score</div>
              </div>
              <div style={pg.intentBarsCol}>
                {survey.purchaseIntentDistribution.map((item) => {
                  const isTop = item.label === 'Would Buy';
                  return (
                    <div key={item.label} style={pg.intentBarRow}>
                      <span style={pg.intentBarLabel}>{item.label}</span>
                      <div style={pg.intentBarTrack}>
                        <div
                          style={{
                            ...pg.intentBarFill,
                            width: `${item.percentage}%`,
                            background: isTop ? '#1a1a2e' : '#9ca3af',
                          }}
                        />
                      </div>
                      <span
                        style={{
                          ...pg.intentBarPct,
                          color: isTop ? '#1a1a2e' : '#666',
                        }}
                      >
                        {item.percentage}%
                        {item.count > 0 && (
                          <span style={pg.intentCount}> ({item.count})</span>
                        )}
                      </span>
                    </div>
                  );
                })}
                <p style={pg.intentNote}>
                  "Would Buy" = respondents selecting 5/5 on purchase intent scale. "Probably" =
                  4/5. "Unsure" = ≤3/5.
                </p>
              </div>
            </div>
          </ReportSection>

          {/* ─── CONSUMER VOICE ─── */}
          <ReportSection title="Consumer Voice" num="04">
            {survey.questionBreakdown['q3'] && survey.questionBreakdown['q3'].length > 0 && (
              <div style={pg.voiceBlock}>
                <div style={pg.chartLabel}>Product Descriptor — Most Common Consumer Responses</div>
                <div style={pg.descriptorList}>
                  {survey.questionBreakdown['q3'].map((item, i) => (
                    <div key={item.label} style={pg.descriptorRow}>
                      <span style={pg.descriptorRank}>{i + 1}</span>
                      <span style={pg.descriptorLabel}>{item.label}</span>
                      <span style={pg.descriptorCount}>{item.count} responses</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={pg.voiceBlock}>
              <div style={pg.chartLabel}>Open-Ended Consumer Feedback</div>
              {survey.verbatims.length > 0 ? (
                survey.verbatims.map((v, i) => (
                  <div key={i} style={pg.verbatim}>
                    <span style={pg.verbatimMark}>"</span>
                    {v}
                  </div>
                ))
              ) : (
                <p style={pg.emptyNote}>
                  {isDemo
                    ? 'No open-ended responses in this sample dataset. In a live campaign, consumer verbatims appear here.'
                    : 'No open-ended responses recorded for this campaign.'}
                </p>
              )}
            </div>
          </ReportSection>

          {/* ─── KEY FINDINGS ─── */}
          <ReportSection title="Key Findings" num="05">
            <div style={pg.findingsGrid}>
              <FindingCard
                type="Strongest Signal"
                heading={`${overview.purchaseIntentPercent}% Purchase Intent`}
                body={`${overview.purchaseIntentPercent}% of respondents indicated they would purchase ${campaign.productName} at retail price following the free trial. ${overview.purchaseIntentPercent >= 60 ? 'This is a strong positive signal for retail launch planning.' : 'This result warrants further research before a broad retail push.'}`}
                positive={overview.purchaseIntentPercent >= 50}
              />

              {topAge && topGender ? (
                <FindingCard
                  type="Primary Segment"
                  heading={`${topGender.label}, ${topAge.label}`}
                  body={`The dominant consumer segment is ${topGender.label} respondents aged ${topAge.label}, representing ${topGender.percentage}% (gender) and ${topAge.percentage}% (age) of the trial cohort. Retail targeting and media placement should prioritize this demographic for initial launch.`}
                  positive
                />
              ) : (
                <FindingCard
                  type="Primary Segment"
                  heading="Insufficient demographic data"
                  body="Not enough participants have provided demographic data to identify a primary segment. Ensure profile collection is enabled on the consumer journey."
                  positive={false}
                />
              )}

              <FindingCard
                type="Data Quality"
                heading={`${overview.completionRate}% Survey Completion`}
                body={`${overview.surveyCompletions} of ${overview.totalRedemptions} trial participants completed the full post-trial survey. ${overview.completionRate >= 70 ? 'Strong completion rate indicates high consumer engagement with the trial experience.' : 'Completion rate below 70% — the post-trial survey UX should be reviewed to reduce friction.'}`}
                positive={overview.completionRate >= 70}
              />

              {topDescriptor ? (
                <FindingCard
                  type="Product Perception"
                  heading={`"${topDescriptor}"`}
                  body={`The most frequently chosen product descriptor is "${topDescriptor}", reflecting how consumers characterize the product after a physical trial. This aligns with${topDescriptor ? ` the brand's intended positioning and` : ''} represents the most common consumer vocabulary — important input for retail packaging and advertising copy.`}
                  positive
                />
              ) : topCity ? (
                <FindingCard
                  type="Geographic Concentration"
                  heading={`${topCity.label} (${topCity.percentage}%)`}
                  body={`${topCity.percentage}% of trial participants came from ${topCity.label}. This concentration reflects the campaign location and provides a strong baseline for ${topCity.label}-focused retail expansion strategy.`}
                  positive
                />
              ) : null}
            </div>
          </ReportSection>

          {/* ─── RECOMMENDATIONS ─── */}
          <ReportSection title="Recommended Actions" num="06">
            <div style={pg.recList}>
              <RecItem
                num={1}
                text={`Focus initial retail distribution on ${topCity?.label ?? campaign.locationName}. Trial data from this location is now available to support placement decisions.`}
              />
              {topAge && topGender && (
                <RecItem
                  num={2}
                  text={`Prioritize ${topGender.label} ${topAge.label} in media and influencer strategy. This segment represents the highest trial participation and likely the highest purchase intent.`}
                />
              )}
              <RecItem
                num={3}
                text={`${overview.purchaseIntentPercent >= 60 ? `With ${overview.purchaseIntentPercent}% purchase intent, the product is well-positioned for the next phase of field sampling. Consider scaling the trial footprint.` : `Purchase intent at ${overview.purchaseIntentPercent}% is a starting point. Consider adjusting the trial experience or targeting before scaling.`}`}
              />
              {topDescriptor && (
                <RecItem
                  num={4}
                  text={`Consumer-chosen descriptor "${topDescriptor}" should be tested as a primary message in retail shelf copy and on-pack communication.`}
                />
              )}
            </div>
          </ReportSection>

          {/* ─── METHODOLOGY ─── */}
          <ReportSection title="Methodology & Data Integrity" num="07" noBorder>
            <div style={pg.methodTable}>
              <MethodRow label="Sample Size" value={`${overview.surveyCompletions} completed surveys (${overview.totalRedemptions} verified trial participants)`} />
              <MethodRow label="Collection Method" value="Physical product trial → QR scan → WhatsApp OTP verification → Mobile web survey" />
              <MethodRow label="Campaign Location" value={campaign.locationName || 'Not specified'} />
              <MethodRow label="Survey Length" value="5 questions: trial rating, purchase intent, product descriptor, overall satisfaction, open-ended feedback" />
              <MethodRow label="Consumer Authentication" value="Phone number + one-time password delivered via WhatsApp (Akedly)" />
              <MethodRow
                label="Data Status"
                value={
                  isDemo
                    ? 'SAMPLE DATA — illustrative figures for evaluation purposes only. Not derived from real consumer interactions.'
                    : 'REAL CAMPAIGN DATA — verified consumer responses from authenticated trial participants.'
                }
                highlight={isDemo}
              />
              <MethodRow label="Report Generated" value={reportDate} last />
            </div>

            {isDemo && (
              <div style={pg.demoDisclaimer}>
                This report contains sample data generated for demonstration and evaluation purposes.
                All figures, including participant counts, demographics, and purchase intent percentages,
                are illustrative. A live campaign report would reflect verified consumer responses from
                real trial participants.
              </div>
            )}

            <div style={pg.limitationsBox}>
              <div style={pg.limitationsTitle}>DATA LIMITATIONS</div>
              <div style={pg.limitationsBody}>
                • Self-selected sample: consumers who accepted and scanned the QR code may not represent the broader consumer population.
                {overview.surveyCompletions < 100 &&
                  ' • Small sample size: findings are directional indicators and should not be treated as statistically representative conclusions.'}
                {' '}• Single-location data: results reflect one trial site and may vary across retail environments or geographies.
                {' '}• Immediate post-trial response: purchase intent captured immediately after a free trial may differ from actual retail purchase behaviour.
              </div>
            </div>
          </ReportSection>

          {/* ─── FOOTER ─── */}
          <div style={pg.footer}>
            <span>Tajribti · Consumer Intelligence Platform</span>
            <span>
              {isDemo ? 'SAMPLE DATA — NOT FOR DISTRIBUTION' : 'CONFIDENTIAL'}
            </span>
            <span>Generated {reportDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function ReportSection({
  title,
  children,
  noBorder,
  num,
}: {
  title: string;
  children: React.ReactNode;
  noBorder?: boolean;
  num?: string;
}) {
  return (
    <div style={{ ...pg.section, ...(noBorder ? {} : pg.sectionBorder) }}>
      <div style={pg.sectionTitleBar}>
        {num && <span style={pg.sectionNum}>{num}</span>}
        <h2 style={pg.sectionTitle}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div style={{ ...pg.kpiCard, ...(accent ? pg.kpiCardAccent : {}) }}>
      <div style={{ ...pg.kpiValue, ...(accent ? pg.kpiValueAccent : {}) }}>{value}</div>
      <div style={pg.kpiLabel}>{label}</div>
    </div>
  );
}

function CssBar({
  label,
  percentage,
  count,
  color,
}: {
  label: string;
  percentage: number;
  count: number;
  color: string;
}) {
  return (
    <div style={pg.barRow}>
      <span style={pg.barLabel}>{label}</span>
      <div style={pg.barTrack}>
        <div style={{ ...pg.barFill, width: `${percentage}%`, background: color }} />
      </div>
      <span style={pg.barPct}>{percentage}%</span>
      <span style={pg.barCount}>({count})</span>
    </div>
  );
}

function FindingCard({
  type,
  heading,
  body,
  positive,
}: {
  type: string;
  heading: string;
  body: string;
  positive: boolean;
}) {
  const accentColor = positive ? '#1a1a2e' : '#d97706';
  return (
    <div style={{ ...pg.findingCard, borderTop: `3px solid ${accentColor}` }}>
      <div style={{ ...pg.findingType, color: accentColor }}>{type}</div>
      <div style={pg.findingHeading}>{heading}</div>
      <div style={pg.findingBody}>{body}</div>
    </div>
  );
}

function RecItem({ num, text }: { num: number; text: string }) {
  return (
    <div style={pg.recItem}>
      <div style={pg.recNum}>{num}</div>
      <div style={pg.recText}>{text}</div>
    </div>
  );
}

function MethodRow({
  label,
  value,
  highlight,
  last,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  last?: boolean;
}) {
  return (
    <div style={{ ...pg.methodRow, ...(last ? pg.methodRowLast : {}) }}>
      <div style={pg.methodLabel}>{label}</div>
      <div style={{ ...pg.methodValue, ...(highlight ? pg.methodValueHighlight : {}) }}>
        {value}
      </div>
    </div>
  );
}

/* ─── Styles ─── */

const outer: Record<string, React.CSSProperties> = {
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
    color: '#92400e',
    background: '#fef3c7',
    border: '1px solid #f59e0b',
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
  subtitle: {
    fontSize: 13,
    color: '#2e3d5e',
    margin: 0,
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
};

const pg: Record<string, React.CSSProperties> = {
  page: {
    background: '#ffffff',
    borderRadius: 8,
    padding: '48px 56px',
    maxWidth: 840,
    margin: '0 auto',
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
    color: '#1a1a2e',
  },

  /* Cover */
  coverBlock: {
    background: '#1a1a2e',
    borderRadius: 12,
    marginBottom: 40,
    overflow: 'hidden',
  },
  coverTopBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 28px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  tajribtiLogo: {
    fontSize: 14,
    fontWeight: 900,
    color: '#ffffff',
    letterSpacing: 5,
    textTransform: 'uppercase' as const,
  },
  demoBanner: {
    background: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: 4,
    padding: '5px 12px',
    fontSize: 10,
    fontWeight: 800,
    color: '#92400e',
    letterSpacing: 0.5,
  },
  demoBannerSub: {
    fontWeight: 400,
    fontSize: 10,
    letterSpacing: 0,
  },
  confidentialBadge: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 4,
    padding: '5px 12px',
    fontSize: 10,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
  },
  coverHero: {
    padding: '36px 28px 28px',
  },
  reportTypeLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2.5,
    textTransform: 'uppercase' as const,
    marginBottom: 10,
  },
  coverProduct: {
    fontSize: 36,
    fontWeight: 900,
    color: '#ffffff',
    margin: '0 0 6px',
    letterSpacing: -1,
    lineHeight: '1.1',
  },
  coverBrand: {
    fontSize: 16,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.65)',
    margin: '0 0 20px',
  },
  coverMetaRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  coverMetaChip: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: '5px 12px',
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 500,
  },
  coverKpis: {
    display: 'flex',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  coverKpi: {
    flex: 1,
    padding: '20px 28px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  coverKpiDivider: {
    width: 1,
    background: 'rgba(255,255,255,0.08)',
    alignSelf: 'stretch',
  },
  coverKpiNum: {
    fontSize: 32,
    fontWeight: 900,
    color: '#ffffff',
    lineHeight: '1',
  },
  coverKpiLabel: {
    fontSize: 10,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  coverMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
  },
  coverLeft: {},
  coverRight: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: 12,
  },

  /* Sections */
  section: {
    marginBottom: 36,
    paddingBottom: 36,
  },
  sectionBorder: {
    borderBottom: '1px solid #e8e8e8',
  },
  sectionTitleBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '2px solid #1a1a2e',
  },
  sectionNum: {
    fontSize: 9,
    fontWeight: 800,
    color: '#ffffff',
    background: '#1a1a2e',
    padding: '3px 7px',
    borderRadius: 4,
    letterSpacing: 0.5,
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 800,
    color: '#1a1a2e',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.8,
    margin: 0,
  },
  sectionIntro: {
    fontSize: 13,
    color: '#555',
    lineHeight: '1.7',
    margin: '0 0 20px',
  },

  /* Narrative */
  narrative: {
    background: '#f8f9fa',
    borderLeft: '4px solid #1a1a2e',
    padding: '20px 24px',
    borderRadius: '0 8px 8px 0' as const,
    marginBottom: 10,
  },
  narrativeLine: {
    margin: '0 0 10px',
    fontSize: 14,
    color: '#222',
    lineHeight: '1.85',
  },
  narrativeMeta: {
    fontSize: 11,
    color: '#aaa',
    margin: '8px 0 24px',
  },

  /* KPI row */
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  kpiCard: {
    background: '#f8f9fa',
    border: '1px solid #eee',
    borderRadius: 8,
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  kpiCardAccent: {
    background: '#f0fdf4',
    borderColor: '#86efac',
  },
  kpiValue: {
    fontSize: 30,
    fontWeight: 900,
    color: '#1a1a2e',
    lineHeight: '1',
  },
  kpiValueAccent: {
    color: '#166534',
  },
  kpiLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: 500,
  },

  /* Demographics grid */
  demoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 28,
  },
  chartLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#888',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  /* CSS Bar */
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  barLabel: {
    width: 70,
    fontSize: 11,
    color: '#555',
    flexShrink: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  barTrack: {
    flex: 1,
    height: 8,
    background: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barPct: {
    width: 30,
    fontSize: 11,
    fontWeight: 700,
    color: '#333',
    textAlign: 'right' as const,
    flexShrink: 0,
  },
  barCount: {
    width: 28,
    fontSize: 10,
    color: '#aaa',
    flexShrink: 0,
  },

  /* Purchase Intent */
  intentLayout: {
    display: 'flex',
    gap: 32,
    alignItems: 'flex-start',
  },
  intentScoreBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    background: '#1a1a2e',
    borderRadius: 12,
    padding: '24px 28px',
    minWidth: 120,
    flexShrink: 0,
  },
  intentScoreNum: {
    fontSize: 52,
    fontWeight: 900,
    color: '#ffffff',
    lineHeight: '1',
  },
  intentScoreMax: {
    fontSize: 14,
    color: '#6b7fa8',
    fontWeight: 600,
    marginBottom: 8,
  },
  intentScoreLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: '#6b7fa8',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    textAlign: 'center' as const,
  },
  intentBarsCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 14,
    paddingTop: 8,
  },
  intentBarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  intentBarLabel: {
    width: 80,
    fontSize: 12,
    color: '#555',
    fontWeight: 500,
    flexShrink: 0,
  },
  intentBarTrack: {
    flex: 1,
    height: 12,
    background: '#f0f0f0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  intentBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  intentBarPct: {
    width: 50,
    fontSize: 13,
    fontWeight: 700,
    textAlign: 'right' as const,
    flexShrink: 0,
  },
  intentCount: {
    fontSize: 11,
    fontWeight: 400,
    color: '#aaa',
  },
  intentNote: {
    fontSize: 10,
    color: '#aaa',
    marginTop: 4,
    lineHeight: '1.6',
  },

  /* Consumer Voice */
  voiceBlock: {
    marginBottom: 20,
  },
  descriptorList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  descriptorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    background: '#f8f9fa',
    borderRadius: 6,
  },
  descriptorRank: {
    width: 22,
    height: 22,
    background: '#1a1a2e',
    color: '#ffffff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 700,
    flexShrink: 0,
  },
  descriptorLabel: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    fontWeight: 500,
  },
  descriptorCount: {
    fontSize: 11,
    color: '#888',
    flexShrink: 0,
  },
  verbatim: {
    borderLeft: '3px solid #1a1a2e',
    padding: '10px 16px',
    marginBottom: 8,
    background: '#f8f9fa',
    borderRadius: '0 6px 6px 0' as const,
    fontSize: 13,
    color: '#444',
    lineHeight: '1.7',
    fontStyle: 'italic' as const,
  },
  verbatimMark: {
    fontSize: 18,
    color: '#1a1a2e',
    fontWeight: 900,
    marginRight: 4,
    fontStyle: 'normal' as const,
  },
  emptyNote: {
    fontSize: 12,
    color: '#aaa',
    margin: 0,
    fontStyle: 'italic' as const,
    lineHeight: '1.6',
  },

  /* Key Findings */
  findingsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  findingCard: {
    background: '#f8f9fa',
    borderRadius: '0 8px 8px 0',
    padding: '16px 20px',
  },
  findingType: {
    fontSize: 8,
    fontWeight: 800,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    marginBottom: 6,
  },
  findingHeading: {
    fontSize: 15,
    fontWeight: 800,
    color: '#1a1a2e',
    marginBottom: 8,
  },
  findingBody: {
    fontSize: 12,
    color: '#555',
    lineHeight: '1.7',
  },

  /* Recommendations */
  recList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },
  recItem: {
    display: 'flex',
    gap: 14,
    alignItems: 'flex-start',
    padding: '14px 16px',
    background: '#f8f9fa',
    borderRadius: 8,
  },
  recNum: {
    width: 24,
    height: 24,
    background: '#1a1a2e',
    color: '#ffffff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 800,
    flexShrink: 0,
  },
  recText: {
    fontSize: 13,
    color: '#333',
    lineHeight: '1.7',
    paddingTop: 2,
  },

  /* Methodology */
  methodTable: {
    border: '1px solid #e8e8e8',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  methodRow: {
    display: 'flex',
    borderBottom: '1px solid #e8e8e8',
  },
  methodRowLast: {
    borderBottom: 'none',
  },
  methodLabel: {
    width: 200,
    padding: '12px 16px',
    background: '#f8f9fa',
    fontSize: 11,
    fontWeight: 700,
    color: '#555',
    flexShrink: 0,
    borderRight: '1px solid #e8e8e8',
    lineHeight: '1.5',
  },
  methodValue: {
    padding: '12px 16px',
    fontSize: 12,
    color: '#333',
    flex: 1,
    lineHeight: '1.6',
  },
  methodValueHighlight: {
    fontWeight: 700,
    color: '#92400e',
    background: '#fef3c7',
  },
  demoDisclaimer: {
    background: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: 6,
    padding: '14px 18px',
    fontSize: 12,
    color: '#92400e',
    lineHeight: '1.7',
    marginBottom: 16,
  },
  limitationsBox: {
    background: '#f8f9fa',
    borderRadius: 6,
    padding: '14px 18px',
  },
  limitationsTitle: {
    fontSize: 9,
    fontWeight: 800,
    color: '#888',
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
  },
  limitationsBody: {
    fontSize: 11,
    color: '#666',
    lineHeight: '1.9',
  },

  /* Footer */
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTop: '1px solid #eee',
    marginTop: 20,
    fontSize: 10,
    color: '#bbb',
  },
};

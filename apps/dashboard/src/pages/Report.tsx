import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { campaignApi, reportApi } from '../api/endpoints';
import type { PdfData } from '../api/types';
import { SECTOR_LABELS } from '../api/types';

/* ─── Arabic string table ─── */
const AR = {
  reportTitle: 'تقرير ذكاء المستهلك',
  loading: 'جارٍ تحضير التقرير…',
  downloadBtn: 'تحميل PDF ←',
  generating: 'جارٍ إنشاء PDF…',
  sampleData: 'بيانات تجريبية',
  confidential: 'سري',
  sampleBanner: 'بيانات تجريبية · لأغراض التقييم فقط',
  respondents: 'مشارك',
  reportedOn: 'تاريخ التقرير',
  verifiedParticipants: 'المشاركون الموثقون',
  completionRate: 'معدل الإتمام',
  purchaseIntent: 'نية الشراء',
  s01: 'الملخص التنفيذي',
  s0Objective: 'هدف الدراسة',
  s02: 'ملف الجمهور',
  s03: 'تحليل نية الشراء',
  s04: 'صوت المستهلك',
  s04b: 'نتائج خاصة بالحملة',
  s05: 'الاكتشافات الرئيسية',
  s06: 'التوصيات',
  s07: 'المنهجية وسلامة البيانات',
  basedOn: 'بناءً على',
  verifiedSurveys: 'استجابة استبيان موثقة · تم الإنشاء',
  audienceIntro: 'أتمّ المستهلكون تجربة فعلية موثقة للمنتج في',
  audienceAuth: 'تحقق جميع المشاركين عبر رمز OTP على واتساب. تعكس البيانات الديموغرافية معلومات مُبلَّغاً عنها ذاتياً مجموعة مباشرة بعد التجربة.',
  audienceIntroDemo: 'هذا قسم بيانات تجريبية يوضّح شكل ملف الجمهور في حملة حقيقية في',
  audienceAuthDemo: 'الأرقام أدناه توضيحية وليست من مشاركين حقيقيين. في حملة حقيقية، يتحقق كل مشارك عبر رمز OTP على واتساب وتُجمع البيانات الديموغرافية مباشرة بعد التجربة الفعلية.',
  ageDistribution: 'التوزيع العمري',
  gender: 'الجنس',
  cityDistrict: 'المدينة / المنطقة',
  intentScore: 'نقاط النية',
  wouldBuy: 'سيشتري',
  probably: 'على الأرجح',
  unsure: 'غير متأكد',
  intentNote: '"سيشتري" = المستجيبون الذين اختاروا 5/5 على مقياس نية الشراء. "على الأرجح" = 4/5. "غير متأكد" = ≤3/5.',
  descriptorsTitle: 'توصيفات المنتج — أكثر استجابات المستهلكين شيوعاً',
  firstImpressionTitle: 'الانطباع الأول (متوسط التقييم)',
  comparisonTitle: 'المقارنة بمنتجات مشابهة',
  verbatimsTitle: 'ملاحظات المستهلك المفتوحة',
  noVerbatimsDemo: 'لا توجد استجابات مفتوحة في مجموعة البيانات التجريبية. في حملة حقيقية، تظهر هنا ملاحظات المستهلكين.',
  noVerbatimsLive: 'لا توجد استجابات مفتوحة مسجلة لهذه الحملة.',
  responses: 'استجابة',
  strongestSignal: 'الإشارة الأقوى',
  primarySegment: 'القطاع الأساسي',
  dataQuality: 'جودة البيانات',
  productPerception: 'تصور المنتج',
  geoConcentration: 'التركيز الجغرافي',
  insufficientDemo: 'بيانات ديموغرافية غير كافية',
  insufficientDemoBody: 'لم يقدم عدد كافٍ من المشاركين بيانات ديموغرافية لتحديد القطاع الأساسي.',
  surveyCompletion: 'إتمام الاستبيان',
  methodSampleSize: 'حجم العينة',
  methodCollection: 'طريقة الجمع',
  methodCollectionVal: 'تجربة فعلية للمنتج ← مسح QR ← تحقق OTP واتساب ← استبيان على الويب',
  methodLocation: 'موقع الحملة',
  methodNotSpecified: 'غير محدد',
  methodSurveyLength: 'طول الاستبيان',
  methodSurveyLengthVal: '5 أسئلة: تقييم التجربة، نية الشراء، وصف المنتج، الرضا العام، ملاحظات مفتوحة',
  methodAuth: 'توثيق المستهلك',
  methodAuthVal: 'رقم هاتف + رمز مرة واحدة عبر واتساب (Akedly)',
  methodDataStatus: 'حالة البيانات',
  methodDataStatusDemo: 'بيانات تجريبية — أرقام توضيحية لأغراض التقييم فقط.',
  methodDataStatusLive: 'بيانات حملة حقيقية — استجابات موثقة من مشاركين حقيقيين.',
  methodGenerated: 'تاريخ الإنشاء',
  demoDisclaimer: 'يتضمن هذا التقرير بيانات تجريبية لأغراض العرض والتقييم. جميع الأرقام توضيحية.',
  dataLimitationsTitle: 'قيود البيانات',
  limitationSelfSelected: '• عينة ذاتية الاختيار: المستهلكون الذين قبلوا مسح الرمز قد لا يمثلون المستهلكين بشكل عام.',
  limitationSmallSample: '• حجم عينة صغير: النتائج مؤشرات توجيهية وليست استنتاجات تمثيلية إحصائياً.',
  limitationSingleLocation: '• بيانات موقع واحد: قد تختلف النتائج عبر بيئات البيع بالتجزئة أو المناطق الجغرافية.',
  limitationImmediate: '• استجابة فورية بعد التجربة: قد تختلف نية الشراء الفورية عن سلوك الشراء الفعلي.',
  footerPlatform: 'تجربتي · منصة ذكاء المستهلك',
  footerNotForDist: 'بيانات تجريبية — غير مخصصة للتوزيع',
  footerGenerated: 'تم الإنشاء',
  narrativeArMissing: '(الملخص التنفيذي بالعربية غير متاح لهذا التقرير المخزّن مؤقتاً — يُعرض النص الإنجليزي أعلاه.)',
};

// `public` mode (Commercial V1 Completion Sprint, 2026-09-01): powers the
// unauthenticated marketing site's Sample Report page — same component,
// same rendering, only the data source changes (the public, demo-only
// `/report/sample` endpoint instead of the authenticated per-campaign
// one). Defaults to the existing authenticated behavior; the `/report`
// route's own behavior is unchanged.
export default function Report({ mode = 'authenticated' }: { mode?: 'authenticated' | 'public' }) {
  const location = useLocation();
  const [data, setData] = useState<PdfData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [isAr, setIsAr] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Re-resolves whenever ?campaignId= changes — see CampaignDetail.tsx.
    setData(null);
    setError('');
    setLoading(true);
    const load =
      mode === 'public'
        ? reportApi.getPublicSample()
        : campaignApi.getSelected().then((c) => reportApi.getPdfData(c.id));
    load
      .then(setData)
      .catch(() => setError('Failed to load report data.'))
      .finally(() => setLoading(false));
  }, [location.search, mode]);

  const t = (en: string, ar: string) => (isAr ? ar : en);

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

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeightMm = (canvas.height * pageWidth) / canvas.width;

      // Page count from raw division can leave a near-empty trailing page
      // (e.g. content at 3.05 pages tall still gets a dedicated 4th page
      // that shows only a sliver of content — D-028 R6). Below this
      // threshold, drop the dedicated trailing page and instead let the
      // true last page's crop end exactly at the content's bottom, which
      // causes a small deliberate overlap with the previous page instead
      // of an almost-blank one.
      const MIN_TRAILING_PAGE_MM = 20;
      const rawPageCount = Math.max(1, Math.ceil(imgHeightMm / pageHeight));
      const lastPageContentMm = imgHeightMm - (rawPageCount - 1) * pageHeight;
      const pageCount =
        rawPageCount > 1 && lastPageContentMm < MIN_TRAILING_PAGE_MM
          ? rawPageCount - 1
          : rawPageCount;

      for (let page = 0; page < pageCount; page++) {
        const isLast = page === pageCount - 1;
        const yOffset = isLast ? imgHeightMm - pageHeight : page * pageHeight;
        pdf.addImage(imgData, 'PNG', 0, -yOffset, pageWidth, imgHeightMm);
        if (!isLast) pdf.addPage();
      }

      const lang = isAr ? 'ar' : 'en';
      const filename = `tajribti-report-${data.campaign.productName.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}-${lang}.pdf`;
      pdf.save(filename);
    } catch {
      setError('PDF generation failed. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div style={outer.loading}>{isAr ? AR.loading : 'Preparing intelligence report…'}</div>;
  if (error) return <div style={outer.error}>{error}</div>;
  if (!data) return null;

  const { campaign, company, overview, demographics, survey, report } = data;
  // Company Foundation (2026-09-01): cover branding only — company may be
  // null (legacy/demo campaign with no owning brandAccountId) and sector
  // may be unset; both are optional decoration, never required for the
  // report to render correctly.
  const sectorLabel = company?.sector ? SECTOR_LABELS[company.sector] : null;
  // Campaign-Specific Findings section (2026-09-01, this pass) only renders
  // when the campaign actually has custom questions — the vast majority of
  // campaigns don't, so the following sections' displayed step numbers stay
  // sequential (06/07/08) rather than jumping to 07/08/09 with a gap.
  const hasCustomFindings = survey.customQuestions.length > 0;
  // Methodology accuracy fix (2026-09-01, this pass): "Survey Length" was
  // hardcoded to always say "5 questions" — true for every campaign until
  // Survey Builder V2 (DL-066/069) let a Company add up to 5 more. A
  // campaign with custom questions was reporting a false question count in
  // its own Methodology section, undermining the "evidence-grounded, never
  // states anything untrue" standard the rest of this report holds itself
  // to. Computed from the actual campaign.surveyQuestions length; wording
  // is byte-identical to before for every campaign that still has exactly
  // 5 (the large majority), so no existing report's text changes.
  const totalQuestionCount = campaign.surveyQuestions?.length ?? 5;
  const surveyLengthValue =
    totalQuestionCount === 5
      ? t(
          '5 questions: trial rating, purchase intent, product descriptor, overall satisfaction, open-ended feedback',
          AR.methodSurveyLengthVal
        )
      : t(
          `${totalQuestionCount} questions: 5 standard trial-research questions plus ${totalQuestionCount - 5} campaign-specific question(s) added by the Company`,
          `${totalQuestionCount} سؤالاً: 5 أسئلة بحثية معيارية بالإضافة إلى ${totalQuestionCount - 5} سؤال خاص بالحملة أضافته الشركة`
        );
  const isDemo = campaign.isDemo;
  // Report narrative text defect fix (2026-09-01, this pass): locationName
  // is an optional Create-Campaign field (campaign.entity.ts: nullable),
  // already correctly guarded on the cover (`campaign.locationName &&`)
  // and the Methodology table (`|| 'Not specified'`), but several
  // narrative sentences interpolated it directly — a campaign created
  // without a location would render a grammatically broken sentence
  // ("...trial at . These figures...") instead of readable text. Applied
  // wherever the report constructs a sentence around it; every campaign
  // that already has a locationName (the large majority, including every
  // real campaign in production today) renders byte-identical text.
  const locationLabel = campaign.locationName || t('the trial location', 'موقع التجربة');
  const topAge = demographics.ageDistribution[0];
  const topGender = demographics.genderDistribution[0];
  const topCity = demographics.cityDistribution[0];
  const topDescriptor = survey.questionBreakdown['q3']?.[0]?.label ?? null;

  const locale = isAr ? 'ar-EG' : 'en-EG';
  const reportDate = new Date(report.createdAt).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Campaign period, if both dates are actually set — no fabricated range.
  const formatShort = (d: string) =>
    new Date(d).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  const campaignPeriod =
    campaign.startDate && campaign.endDate
      ? `${formatShort(campaign.startDate)} – ${formatShort(campaign.endDate)}`
      : null;

  const fontFamily = isAr
    ? "'Cairo', 'Segoe UI', Arial, sans-serif"
    : "'Inter', 'Segoe UI', Arial, sans-serif";

  const pageStyle: React.CSSProperties = {
    ...pg.page,
    fontFamily,
    direction: isAr ? 'rtl' : 'ltr',
    textAlign: isAr ? 'right' : 'left',
  };

  /* RTL-aware border flip for narrative / verbatim blocks */
  const narrativeStyle: React.CSSProperties = isAr
    ? { ...pg.narrative, borderLeft: 'none', borderRight: '4px solid #1a1a2e', borderRadius: '8px 0 0 8px' }
    : pg.narrative;

  const verbatimStyle = (v: string) => {
    const base: React.CSSProperties = isAr
      ? { ...pg.verbatim, borderLeft: 'none', borderRight: '3px solid #1a1a2e', borderRadius: '6px 0 0 6px' }
      : pg.verbatim;
    return base;
  };

  return (
    <div>
      {/* Page header — not captured in PDF */}
      <div style={outer.actionBar}>
        <div>
          {isDemo && <span style={outer.demoBadge}>{t('SAMPLE DATA', AR.sampleData)}</span>}
          <h1 style={outer.title}>{t('Campaign Intelligence Report', AR.reportTitle)}</h1>
          <p style={outer.subtitle}>
            {campaign.brandName} · {campaign.productName}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            style={outer.langBtn}
            onClick={() => setIsAr(!isAr)}
          >
            {isAr ? 'EN' : 'عربي'}
          </button>
          <button style={outer.downloadBtn} onClick={handleDownload} disabled={generating}>
            {generating ? t('Generating PDF…', AR.generating) : t('Download PDF →', AR.downloadBtn)}
          </button>
        </div>
      </div>

      <div style={outer.reportOuter}>
        <div ref={reportRef} style={pageStyle}>
          {/* ─── COVER ─── */}
          <div style={pg.coverBlock}>
            <div style={pg.coverTopBar}>
              <div style={pg.coverTopBarLeft}>
                <div style={{ ...pg.tajribtiLogo, fontFamily: isAr ? "'Cairo', sans-serif" : undefined }}>
                  {isAr ? 'تجربتي' : 'TAJRIBTI'}
                </div>
                {company?.logoUrl && (
                  <img src={company.logoUrl} alt={company.name} style={pg.companyLogo} />
                )}
              </div>
              {isDemo ? (
                <div style={pg.demoBanner}>{t('SAMPLE DATA · For evaluation purposes only', AR.sampleBanner)}</div>
              ) : (
                <div style={pg.confidentialBadge}>{t('CONFIDENTIAL', AR.confidential)}</div>
              )}
            </div>
            <div style={pg.coverHero}>
              <div style={pg.reportTypeLabel}>{t('CONSUMER INTELLIGENCE REPORT', AR.reportTitle.toUpperCase())}</div>
              <h1 style={pg.coverProduct}>{campaign.productName}</h1>
              <p style={pg.coverBrand}>{campaign.brandName}</p>
              <div style={pg.coverMetaRow}>
                {campaign.locationName && (
                  <span style={pg.coverMetaChip}>
                    <span style={pg.coverMetaLabel}>{t('Location', 'الموقع')}</span>
                    {' · '}
                    {campaign.locationName}
                  </span>
                )}
                {campaignPeriod && (
                  <span style={pg.coverMetaChip}>
                    <span style={pg.coverMetaLabel}>{t('Period', 'الفترة')}</span>
                    {' · '}
                    {campaignPeriod}
                  </span>
                )}
                {sectorLabel && (
                  <span style={pg.coverMetaChip}>
                    <span style={pg.coverMetaLabel}>{t('Sector', 'القطاع')}</span>
                    {' · '}
                    {sectorLabel}
                  </span>
                )}
                <span style={pg.coverMetaChip}>
                  <span style={pg.coverMetaLabel}>{t('Reported', AR.reportedOn)}</span>
                  {' · '}
                  {reportDate}
                </span>
                <span style={pg.coverMetaChip}>
                  {overview.surveyCompletions} {t('respondents', AR.respondents)}
                </span>
              </div>
            </div>
            <div style={pg.coverKpis}>
              <div style={pg.coverKpi}>
                <div style={pg.coverKpiNum}>{overview.totalRedemptions}</div>
                <div style={pg.coverKpiLabel}>{t('Verified Participants', AR.verifiedParticipants)}</div>
              </div>
              <div style={pg.coverKpiDivider} />
              <div style={pg.coverKpi}>
                <div style={pg.coverKpiNum}>{overview.completionRate}%</div>
                <div style={pg.coverKpiLabel}>{t('Completion Rate', AR.completionRate)}</div>
              </div>
              <div style={pg.coverKpiDivider} />
              <div style={pg.coverKpi}>
                <div style={{
                  ...pg.coverKpiNum,
                  color: overview.purchaseIntentPercent >= 50 ? '#166534' : '#92400e',
                }}>
                  {overview.purchaseIntentPercent}%
                </div>
                <div style={pg.coverKpiLabel}>{t('Purchase Intent', AR.purchaseIntent)}</div>
              </div>
            </div>
          </div>

          {/* ─── EXECUTIVE SUMMARY ─── */}
          <ReportSection title={t('Executive Summary', AR.s01)} num="01" isAr={isAr}>
            <div style={narrativeStyle}>
              {(isAr && report.narrativeAr ? report.narrativeAr : report.narrative)
                .split('\n')
                .map((line, i) => {
                  if (!line.trim()) return <br key={i} />;
                  return (
                    <p key={i} style={pg.narrativeLine}>
                      {line}
                    </p>
                  );
                })}
              {isAr && !report.narrativeAr && (
                <p style={pg.narrativeMeta}>
                  {AR.narrativeArMissing}
                </p>
              )}
            </div>
            <p style={pg.narrativeMeta}>
              {t(
                `Based on ${report.responseCountAtGeneration} verified survey responses · Generated ${reportDate}`,
                `${AR.basedOn} ${report.responseCountAtGeneration} ${AR.verifiedSurveys} ${reportDate}`
              )}
            </p>

            <div style={pg.kpiRow}>
              <KpiCard label={t('Verified Participants', AR.verifiedParticipants)} value={overview.totalRedemptions} />
              <KpiCard
                label={t('Survey Completion Rate', AR.completionRate)}
                value={`${overview.completionRate}%`}
              />
              <KpiCard
                label={t('Purchase Intent', AR.purchaseIntent)}
                value={`${overview.purchaseIntentPercent}%`}
                accent
              />
            </div>
          </ReportSection>

          {/* ─── RESEARCH OBJECTIVE ─── */}
          {/* DL-114 (2026-09-06): campaign.objective is the brand's specific
              research question — "Measure purchase intent for X among women 18–34"
              — set at campaign creation and stored as a free-text nullable field.
              When present it must lead the section; the standard TAJRIBTI
              methodology description follows as "Approach" context. When absent,
              only the methodology paragraph renders — behaviour identical to
              pre-DL-114. This closes the Objective → Result traceability gap
              identified in the PRODUCT RECOMPOSITION pass: without it the Report
              never answered "WHY did this brand run this campaign?", only
              "how does TAJRIBTI work in general." */}
          <ReportSection title={t('Research Objective', AR.s0Objective)} num="02" isAr={isAr}>
            {campaign.objective && (
              <div style={pg.objectiveCallout}>
                <div style={pg.objectiveCalloutLabel}>
                  {t('Campaign Research Question', 'السؤال البحثي للحملة')}
                </div>
                <p style={pg.objectiveCalloutText}>{campaign.objective}</p>
              </div>
            )}
            <p style={pg.sectionIntro}>
              {t(
                `This study was designed to capture real-time, in-moment consumer response to ${campaign.productName} from ${campaign.brandName} during an actual physical product trial — not a recall survey conducted after the fact. It measures whether consumers who tried the product would purchase it at retail, how they describe the product in their own words, and their demographic profile. This is the standard consumer-intelligence objective for every Tajribti campaign: converting the moment of first experience into structured, decision-ready data.`,
                `صُممت هذه الدراسة لرصد استجابة المستهلك الفورية والحقيقية تجاه ${campaign.productName} من ${campaign.brandName} أثناء تجربة فعلية للمنتج — وليس عبر استبيان استرجاعي لاحق. تقيس الدراسة ما إذا كان المستهلكون الذين جرّبوا المنتج سيشترونه بسعر التجزئة، وكيف يصفون المنتج بكلماتهم الخاصة، وملفهم الديموغرافي. هذا هو الهدف البحثي المعياري لكل حملة تجربتي: تحويل لحظة التجربة الأولى إلى بيانات منظّمة وجاهزة لاتخاذ القرار.`
              )}
            </p>
          </ReportSection>

          {/* ─── AUDIENCE PROFILE ─── */}
          <ReportSection title={t('Audience Profile', AR.s02)} num="03" isAr={isAr}>
            <p style={pg.sectionIntro}>
              {isDemo
                ? t(
                    `This section shows sample data illustrating what an audience profile looks like for a real campaign at ${locationLabel}. These figures are illustrative, not from real participants. In a live campaign, every participant authenticates via WhatsApp OTP and demographics are collected immediately post-trial.`,
                    `${AR.audienceIntroDemo} ${locationLabel}. ${AR.audienceAuthDemo}`
                  )
                : t(
                    `${overview.totalRedemptions} consumers completed a verified physical product trial at ${locationLabel}. All participants authenticated via WhatsApp OTP. Demographics reflect self-reported data collected immediately post-trial.`,
                    `${AR.audienceIntro} ${locationLabel}. ${AR.audienceAuth}`
                  )}
            </p>

            <div style={pg.demoGrid}>
              <div>
                <div style={pg.chartLabel}>{t('Age Distribution', AR.ageDistribution)}</div>
                {demographics.ageDistribution.map((item) => (
                  <CssBar
                    key={item.label}
                    label={item.label}
                    percentage={item.percentage}
                    count={item.count}
                    color="#1a1a2e"
                    isAr={isAr}
                  />
                ))}
              </div>
              <div>
                <div style={pg.chartLabel}>{t('Gender', AR.gender)}</div>
                {demographics.genderDistribution.map((item, i) => (
                  <CssBar
                    key={item.label}
                    label={item.label}
                    percentage={item.percentage}
                    count={item.count}
                    color={i === 0 ? '#1a1a2e' : '#6b7fa8'}
                    isAr={isAr}
                  />
                ))}
              </div>
              <div>
                <div style={pg.chartLabel}>{t('City / District', AR.cityDistrict)}</div>
                {demographics.cityDistribution.slice(0, 5).map((item) => (
                  <CssBar
                    key={item.label}
                    label={item.label}
                    percentage={item.percentage}
                    count={item.count}
                    color="#1a1a2e"
                    isAr={isAr}
                  />
                ))}
              </div>
            </div>
          </ReportSection>

          {/* ─── PURCHASE INTENT ─── */}
          <ReportSection title={t('Purchase Intent Analysis', AR.s03)} num="04" isAr={isAr}>
            <div style={pg.intentLayout}>
              <div style={pg.intentScoreBox}>
                <div style={pg.intentScoreNum}>{survey.purchaseIntentScore}</div>
                <div style={pg.intentScoreMax}>/100</div>
                <div style={pg.intentScoreLabel}>{t('Intent Score', AR.intentScore)}</div>
              </div>
              <div style={pg.intentBarsCol}>
                {survey.purchaseIntentDistribution.map((item) => {
                  const isTop = item.label === 'Would Buy';
                  const label = isAr
                    ? (item.label === 'Would Buy' ? AR.wouldBuy : item.label === 'Probably' ? AR.probably : AR.unsure)
                    : item.label;
                  return (
                    <div key={item.label} style={pg.intentBarRow}>
                      <span style={pg.intentBarLabel}>{label}</span>
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
                <p style={pg.intentNote}>{t(
                  '"Would Buy" = respondents selecting 5/5 on purchase intent scale. "Probably" = 4/5. "Unsure" = ≤3/5.',
                  AR.intentNote
                )}</p>
              </div>
            </div>
          </ReportSection>

          {/* ─── CONSUMER VOICE ─── */}
          <ReportSection title={t('Consumer Voice', AR.s04)} num="05" isAr={isAr}>
            {/* Product Completion Wave (2026-09-02): q1 (first impression)
                and q4 (compared to similar products) are part of every
                campaign's default survey — same as q3/verbatims below —
                captured all along but never rendered in this report.
                Additive only: nothing else in this section changed, and a
                campaign with zero q1/q4 responses renders nothing here,
                same zero-visual-change guarantee the rest of this file
                already follows for its own conditional blocks. */}
            {survey.firstImpressionScore.responseCount > 0 && (
              <div style={pg.voiceBlock}>
                <div style={pg.chartLabel}>{t('First Impression (Average Rating)', AR.firstImpressionTitle)}</div>
                <div style={pg.descriptorRow}>
                  <span style={pg.descriptorLabel}>{survey.firstImpressionScore.average} / 5</span>
                  <span style={pg.descriptorCount}>
                    {survey.firstImpressionScore.responseCount} {t('responses', AR.responses)}
                  </span>
                </div>
              </div>
            )}

            {survey.questionBreakdown['q4'] && survey.questionBreakdown['q4'].length > 0 && (
              <div style={pg.voiceBlock}>
                <div style={pg.chartLabel}>{t('Compared to Similar Products', AR.comparisonTitle)}</div>
                <div style={pg.descriptorList}>
                  {survey.questionBreakdown['q4'].map((item, i) => (
                    <div key={item.label} style={pg.descriptorRow}>
                      <span style={pg.descriptorRank}>{i + 1}</span>
                      <span style={pg.descriptorLabel}>{item.label}</span>
                      <span style={pg.descriptorCount}>{item.count} {t('responses', AR.responses)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {survey.questionBreakdown['q3'] && survey.questionBreakdown['q3'].length > 0 && (
              <div style={pg.voiceBlock}>
                <div style={pg.chartLabel}>{t('Product Descriptor — Most Common Consumer Responses', AR.descriptorsTitle)}</div>
                <div style={pg.descriptorList}>
                  {survey.questionBreakdown['q3'].map((item, i) => (
                    <div key={item.label} style={pg.descriptorRow}>
                      <span style={pg.descriptorRank}>{i + 1}</span>
                      <span style={pg.descriptorLabel}>{item.label}</span>
                      <span style={pg.descriptorCount}>{item.count} {t('responses', AR.responses)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={pg.voiceBlock}>
              <div style={pg.chartLabel}>{t('Open-Ended Consumer Feedback', AR.verbatimsTitle)}</div>
              {survey.verbatims.length > 0 ? (
                survey.verbatims.map((v, i) => (
                  <div key={i} style={verbatimStyle(v)}>
                    <span style={pg.verbatimMark}>"</span>
                    {v}
                  </div>
                ))
              ) : (
                <p style={pg.emptyNote}>
                  {isDemo
                    ? t(
                        'No open-ended responses in this sample dataset. In a live campaign, consumer verbatims appear here.',
                        AR.noVerbatimsDemo
                      )
                    : t(
                        'No open-ended responses recorded for this campaign.',
                        AR.noVerbatimsLive
                      )}
                </p>
              )}
            </div>
          </ReportSection>

          {/* ─── CAMPAIGN-SPECIFIC FINDINGS ─── */}
          {/* Survey Builder V2 (2026-09-01, this pass): the data this section
              renders (survey.customQuestions) was already computed by
              analytics.service.ts and already returned by report.service.ts's
              generatePdfData() — this section only renders it. Every existing
              campaign with zero custom questions (the vast majority, including
              every historical report generated so far) renders nothing here;
              customQuestions.length === 0 skips the section entirely, so no
              existing report's appearance changes. */}
          {survey.customQuestions.length > 0 && (
            <ReportSection title={t('Campaign-Specific Findings', AR.s04b)} num="06" isAr={isAr}>
              <p style={pg.emptyNote}>
                {t(
                  'Questions this Company added specifically for this campaign, beyond the standard trial-research core.',
                  'أسئلة أضافتها الشركة خصيصاً لهذه الحملة، بالإضافة إلى الأسئلة الأساسية المعيارية.'
                )}
              </p>
              {survey.customQuestions.map((q) => (
                <div key={q.id} style={pg.voiceBlock}>
                  <div style={pg.chartLabel}>{isAr && q.textAr ? q.textAr : q.text}</div>
                  {q.responseCount === 0 ? (
                    <p style={pg.emptyNote}>{t('No responses to this question yet.', 'لا توجد إجابات على هذا السؤال حتى الآن.')}</p>
                  ) : q.breakdown && q.breakdown.length > 0 ? (
                    <div style={pg.descriptorList}>
                      {q.breakdown.map((item, i) => (
                        <div key={item.label} style={pg.descriptorRow}>
                          <span style={pg.descriptorRank}>{i + 1}</span>
                          <span style={pg.descriptorLabel}>{item.label}</span>
                          <span style={pg.descriptorCount}>{item.count} {t('responses', AR.responses)}</span>
                        </div>
                      ))}
                    </div>
                  ) : q.average !== undefined ? (
                    <p style={pg.narrativeLine}>
                      {t(
                        `Average rating: ${q.average} / 5 across ${q.responseCount} response(s).`,
                        `متوسط التقييم: ${q.average} / 5 من إجمالي ${q.responseCount} إجابة.`
                      )}
                    </p>
                  ) : q.verbatims && q.verbatims.length > 0 ? (
                    q.verbatims.map((v, i) => (
                      <div key={i} style={verbatimStyle(v)}>
                        <span style={pg.verbatimMark}>"</span>
                        {v}
                      </div>
                    ))
                  ) : (
                    <p style={pg.emptyNote}>{t('No open-ended responses meet the display threshold yet.', 'لا توجد إجابات مفتوحة كافية للعرض حتى الآن.')}</p>
                  )}
                </div>
              ))}
            </ReportSection>
          )}

          {/* ─── KEY FINDINGS ─── */}
          <ReportSection title={t('Key Findings', AR.s05)} num={hasCustomFindings ? '07' : '06'} isAr={isAr}>
            <div style={pg.findingsGrid}>
              <FindingCard
                type={t('Strongest Signal', AR.strongestSignal)}
                heading={`${overview.purchaseIntentPercent}% ${t('Purchase Intent', AR.purchaseIntent)}`}
                body={isAr
                  ? `${overview.purchaseIntentPercent}% من المستجيبين أشاروا إلى نيتهم شراء ${campaign.productName} بسعر التجزئة بعد التجربة المجانية. ${overview.purchaseIntentPercent >= 60 ? 'هذه إشارة إيجابية قوية لتخطيط الإطلاق بالتجزئة.' : 'تستوجب هذه النتيجة مزيداً من البحث قبل التوسع.'}`
                  : `${overview.purchaseIntentPercent}% of respondents indicated they would purchase ${campaign.productName} at retail price following the free trial. ${overview.purchaseIntentPercent >= 60 ? 'This is a strong positive signal for retail launch planning.' : 'This result warrants further research before a broad retail push.'}`
                }
                positive={overview.purchaseIntentPercent >= 50}
              />

              {topAge && topGender ? (
                <FindingCard
                  type={t('Primary Segment', AR.primarySegment)}
                  heading={`${topGender.label}، ${topAge.label}`}
                  body={isAr
                    ? `القطاع الأكبر ضمن هذه العينة هو المستجيبون من الفئة ${topGender.label} بأعمار ${topAge.label}، يمثلون ${topGender.percentage}% (الجنس) و${topAge.percentage}% (العمر) من مجموع المشاركين في التجربة. هذا وصف لتركيبة العينة، وليس دليلاً على أن هذا القطاع يمثل السوق المستهدف.`
                    : `The largest segment within this sample is ${topGender.label} respondents aged ${topAge.label}, representing ${topGender.percentage}% (gender) and ${topAge.percentage}% (age) of the trial cohort. This describes sample composition — it is not evidence that this segment is the target market.`
                  }
                  positive
                />
              ) : (
                <FindingCard
                  type={t('Primary Segment', AR.primarySegment)}
                  heading={t('Insufficient demographic data', AR.insufficientDemo)}
                  body={t(
                    'Not enough participants have provided demographic data to identify a primary segment.',
                    AR.insufficientDemoBody
                  )}
                  positive={false}
                />
              )}

              <FindingCard
                type={t('Data Quality', AR.dataQuality)}
                heading={`${overview.completionRate}% ${t('Survey Completion', AR.surveyCompletion)}`}
                body={isAr
                  ? `أتمّ ${overview.surveyCompletions} من أصل ${overview.totalRedemptions} مشاركاً الاستبيان الكامل. ${overview.completionRate >= 70 ? 'معدل إتمام قوي يعكس تفاعلاً عالياً مع تجربة المنتج.' : 'معدل الإتمام أقل من 70% — ينبغي مراجعة تجربة الاستبيان لتقليل الاحتكاك.'}`
                  : `${overview.surveyCompletions} of ${overview.totalRedemptions} trial participants completed the full post-trial survey. ${overview.completionRate >= 70 ? 'Strong completion rate indicates high consumer engagement with the trial experience.' : 'Completion rate below 70% — the post-trial survey UX should be reviewed to reduce friction.'}`
                }
                positive={overview.completionRate >= 70}
              />

              {topDescriptor ? (
                <FindingCard
                  type={t('Product Perception', AR.productPerception)}
                  heading={`"${topDescriptor}"`}
                  body={isAr
                    ? `أكثر توصيف اختاره المستهلكون للمنتج هو "${topDescriptor}"، مما يعكس الصورة الذهنية التي تكوّنت بعد التجربة الفعلية. هذا مدخل مهم لصياغة رسائل التعبئة والإعلان.`
                    : `The most frequently chosen product descriptor is "${topDescriptor}", reflecting how consumers characterize the product after a physical trial. Important input for retail packaging and advertising copy.`
                  }
                  positive
                />
              ) : topCity ? (
                <FindingCard
                  type={t('Geographic Concentration', AR.geoConcentration)}
                  heading={`${topCity.label} (${topCity.percentage}%)`}
                  body={isAr
                    ? `${topCity.percentage}% من المشاركين في التجربة جاؤوا من ${topCity.label}. هذا يعكس مكان إجراء التجربة، وليس بالضرورة دليلاً على أن ${topCity.label} هي أفضل سوق للتوسع بالتجزئة.`
                    : `${topCity.percentage}% of trial participants came from ${topCity.label}. This reflects where the trial took place, not necessarily evidence that ${topCity.label} is the strongest market for retail expansion.`
                  }
                  positive
                />
              ) : null}
            </div>
          </ReportSection>

          {/* ─── RECOMMENDATIONS ─── */}
          <ReportSection title={t('Recommended Actions', AR.s06)} num={hasCustomFindings ? '08' : '07'} isAr={isAr}>
            <div style={pg.recList}>
              <RecItem
                num={1}
                text={isAr
                  ? `${topCity?.label ?? locationLabel} كانت موقع هذه التجربة وليست بالضرورة أفضل سوق للتوزيع. فكّر في التحقق من الإشارة عبر تجربة إضافية في موقع آخر قبل اتخاذ قرار توزيع كبير بناءً على هذا الموقع وحده.`
                  : `${topCity?.label ?? locationLabel} was this trial's location, not necessarily the strongest retail market — sample concentration here reflects where the trial ran, not proven market demand. Consider validating with an additional trial location before committing distribution decisions to this area alone.`
                }
              />
              {topAge && topGender && (
                <RecItem
                  num={2}
                  text={isAr
                    ? `سجّلت فئة ${topGender.label} بعمر ${topAge.label} أعلى نسبة مشاركة ضمن هذه العينة${overview.surveyCompletions < 30 ? ' الصغيرة' : ''}. هذا مؤشر توجيهي، وليس دليلاً على أن هذا القطاع هو السوق المستهدف الأساسي — يُقترح اختباره في حملة لاحقة قبل تخصيص ميزانية إعلامية كبيرة له.`
                    : `The ${topGender.label} ${topAge.label} segment showed the highest trial participation within this${overview.surveyCompletions < 30 ? ' small' : ''} sample. This is a directional signal, not proof that this segment is the primary target market — consider testing it in a follow-up campaign before committing significant media budget to it.`
                  }
                />
              )}
              <RecItem
                num={3}
                text={isAr
                  ? (overview.purchaseIntentPercent >= 60
                    ? `نية الشراء عند ${overview.purchaseIntentPercent}% ضمن هذه العينة إشارة إيجابية مبكرة. يُقترح دراسة توسيع نطاق التجارب الميدانية للتحقق من ثبات هذه النتيجة قبل التوسع الكامل.`
                    : `نية الشراء عند ${overview.purchaseIntentPercent}% نقطة بداية فقط ضمن هذه العينة. يُنصح بمراجعة تجربة المنتج أو الاستهداف قبل التفكير في التوسع.`)
                  : (overview.purchaseIntentPercent >= 60
                    ? `Purchase intent of ${overview.purchaseIntentPercent}% within this sample is an early positive signal. Consider validating it with an additional trial before scaling distribution based on this result alone.`
                    : `Purchase intent of ${overview.purchaseIntentPercent}% within this sample is a starting point, not a conclusion. Consider reviewing the trial experience or targeting before considering any scale-up.`)
                }
              />
              {topDescriptor && (
                <RecItem
                  num={4}
                  text={isAr
                    ? `التوصيف الأكثر اختياراً من المستهلكين كان "${topDescriptor}". يُقترح اختبار هذا التوصيف كرسالة محتملة في نصوص الرف التجاري والتواصل على العبوة، مع التحقق من صحته عبر عينة أكبر.`
                    : `The most frequently chosen consumer descriptor was "${topDescriptor}". Consider testing this as a candidate message in retail shelf copy and on-pack communication, validating it with a larger sample first.`
                  }
                />
              )}
            </div>
          </ReportSection>

          {/* ─── METHODOLOGY ─── */}
          <ReportSection title={t('Methodology & Data Integrity', AR.s07)} num={hasCustomFindings ? '09' : '08'} noBorder isAr={isAr}>
            <div style={pg.methodTable}>
              <MethodRow
                label={t('Sample Size', AR.methodSampleSize)}
                value={`${overview.surveyCompletions} ${t('completed surveys', 'استبيان مكتمل')} (${overview.totalRedemptions} ${t('verified trial participants', 'مشارك موثق في التجربة')})`}
              />
              <MethodRow
                label={t('Collection Method', AR.methodCollection)}
                value={t(
                  'Physical product trial → QR scan → WhatsApp OTP verification → Mobile web survey',
                  AR.methodCollectionVal
                )}
              />
              <MethodRow
                label={t('Campaign Location', AR.methodLocation)}
                value={campaign.locationName || t('Not specified', AR.methodNotSpecified)}
              />
              <MethodRow
                label={t('Survey Length', AR.methodSurveyLength)}
                value={surveyLengthValue}
              />
              <MethodRow
                label={t('Consumer Authentication', AR.methodAuth)}
                value={t(
                  'Phone number + one-time password delivered via WhatsApp (Akedly)',
                  AR.methodAuthVal
                )}
              />
              <MethodRow
                label={t('Data Status', AR.methodDataStatus)}
                value={isDemo
                  ? t(
                      'SAMPLE DATA — illustrative figures for evaluation purposes only. Not derived from real consumer interactions.',
                      AR.methodDataStatusDemo
                    )
                  : t(
                      'REAL CAMPAIGN DATA — verified consumer responses from authenticated trial participants.',
                      AR.methodDataStatusLive
                    )
                }
                highlight={isDemo}
              />
              <MethodRow
                label={t('Report Generated', AR.methodGenerated)}
                value={reportDate}
                last
              />
            </div>

            {isDemo && (
              <div style={pg.demoDisclaimer}>
                {t(
                  'This report contains sample data generated for demonstration and evaluation purposes. All figures, including participant counts, demographics, and purchase intent percentages, are illustrative. A live campaign report would reflect verified consumer responses from real trial participants.',
                  AR.demoDisclaimer
                )}
              </div>
            )}

            <div style={pg.limitationsBox}>
              <div style={pg.limitationsTitle}>{t('DATA LIMITATIONS', AR.dataLimitationsTitle)}</div>
              <div style={pg.limitationsBody}>
                {t(
                  '• Self-selected sample: consumers who accepted and scanned the QR code may not represent the broader consumer population.',
                  AR.limitationSelfSelected
                )}
                {overview.surveyCompletions < 100 && (
                  <>{' '}{t(
                    '• Small sample size: findings are directional indicators and should not be treated as statistically representative conclusions.',
                    AR.limitationSmallSample
                  )}</>
                )}
                {' '}{t(
                  '• Single-location data: results reflect one trial site and may vary across retail environments or geographies.',
                  AR.limitationSingleLocation
                )}
                {' '}{t(
                  '• Immediate post-trial response: purchase intent captured immediately after a free trial may differ from actual retail purchase behaviour.',
                  AR.limitationImmediate
                )}
              </div>
            </div>
          </ReportSection>

          {/* ─── FOOTER ─── */}
          <div style={pg.footer}>
            <span>{t('Tajribti · Consumer Intelligence Platform', AR.footerPlatform)}</span>
            <span>
              {isDemo
                ? t('SAMPLE DATA — NOT FOR DISTRIBUTION', AR.footerNotForDist)
                : t('CONFIDENTIAL', AR.confidential)}
            </span>
            <span>{t('Generated', AR.footerGenerated)} {reportDate}</span>
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
  isAr,
}: {
  title: string;
  children: React.ReactNode;
  noBorder?: boolean;
  num?: string;
  isAr?: boolean;
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
  isAr,
}: {
  label: string;
  percentage: number;
  count: number;
  color: string;
  isAr?: boolean;
}) {
  return (
    <div style={{ ...pg.barRow, flexDirection: isAr ? 'row-reverse' : 'row' }}>
      <span style={{ ...pg.barLabel, textAlign: isAr ? 'right' : 'left' }}>{label}</span>
      <div style={pg.barTrack}>
        <div style={{ ...pg.barFill, width: `${percentage}%`, background: color }} />
      </div>
      <span style={{ ...pg.barPct, textAlign: isAr ? 'left' : 'right' }}>{percentage}%</span>
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
  loading: { color: '#7a8bab', fontSize: 14, marginTop: 32 },
  error: { color: '#dc2626', fontSize: 14, marginTop: 32 },
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
    color: '#0a1120',
    margin: '4px 0',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#7a8bab',
    margin: 0,
  },
  langBtn: {
    background: 'rgba(255,255,255,0.06)',
    color: '#0a1120',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: '10px 18px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: 0.5,
    marginTop: 12,
    fontFamily: "'Cairo', 'Inter', sans-serif",
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
    background: '#ffffff',
    border: '1px solid #e8ecf3',
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
  coverTopBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  companyLogo: {
    height: 22,
    maxWidth: 100,
    objectFit: 'contain' as const,
    borderLeft: '1px solid rgba(255,255,255,0.15)',
    paddingLeft: 14,
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
  coverMetaLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
    fontSize: 9,
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

  /* DL-114: campaign-specific research question callout in Research Objective */
  objectiveCallout: {
    background: '#f0fdf0',
    border: '1px solid #b2f24d',
    borderLeft: '4px solid #b2f24d',
    borderRadius: '0 8px 8px 0' as const,
    padding: '14px 18px',
    marginBottom: 18,
  },
  objectiveCalloutLabel: {
    fontSize: 9,
    fontWeight: 800,
    color: '#3a6b00',
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    marginBottom: 6,
  },
  objectiveCalloutText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1a2e00',
    lineHeight: '1.5',
    margin: 0,
    fontStyle: 'italic' as const,
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
    color: '#4a5a7e',
    fontWeight: 600,
    marginBottom: 8,
  },
  intentScoreLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: '#4a5a7e',
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

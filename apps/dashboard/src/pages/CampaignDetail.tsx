import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { campaignApi, qrApi, companyApi, assetsApi } from '../api/endpoints';
import type { Campaign, SurveyQuestion, BrandContact } from '../api/types';
import SurveyEditor from '../components/SurveyEditor';

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const STATUS_OPTIONS = ['draft', 'active', 'paused', 'completed', 'archived'];
// Statuses that end a campaign's active life — confirmed before saving so a
// brand doesn't lose QR/discovery visibility by an accidental dropdown
// click. Not a state machine (any status can still move to any other, same
// as before); this is only a confirmation gate on the destructive-feeling
// transitions.
const LIFECYCLE_ENDING_STATUSES = ['completed', 'archived'];

export default function CampaignDetail() {
  const location = useLocation();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // QR image generation is a second, independent network call after the
  // campaign itself has already loaded — previously a QR-fetch failure
  // (transient network blip, slow response, etc.) rejected the same promise
  // chain the campaign load used, so the `error` catch below fired and threw
  // away the already-loaded `campaign` state, rendering the generic
  // "Failed to load campaign" message even though the campaign loaded fine
  // and only its QR image did not. Confirmed via Founder production QA
  // (2026-09-02): "Details & QR" showed that exact message while the
  // Company Console itself was functioning and campaigns were visible.
  // Tracked separately so a QR failure degrades only the QR card, not the
  // whole page.
  const [qrError, setQrError] = useState('');

  // Internal Tajribti Campaign Operations (DL-055 item 1) — edit + status
  // lifecycle for the loaded campaign. Local form state mirrors `campaign`
  // once it loads and is only sent to the server on explicit Save.
  const [editStatus, setEditStatus] = useState('active');
  const [editRewardPoints, setEditRewardPoints] = useState('');
  const [editTargetCount, setEditTargetCount] = useState('');
  // Campaign Scheduling (2026-09-01): startDate is now editable — nothing
  // in participation gating actually depended on it being fixed after
  // creation; the API now enforces endDate >= startDate on save.
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editProductImage, setEditProductImage] = useState('');
  const [editLocationName, setEditLocationName] = useState('');
  const [editLocationAddress, setEditLocationAddress] = useState('');
  // Survey Builder V2 (Company Console Product Maturation, 2026-09-01):
  // the core 5 questions' id/type/order stay fixed (enforced server-side
  // too, since analytics/AI Insights/Report read their answers by fixed
  // key) — SurveyEditor only allows wording/options edits on those.
  // Anything beyond the core 5 is free to add/remove/reorder/retype.
  const [editSurveyQuestions, setEditSurveyQuestions] = useState<SurveyQuestion[]>([]);
  // Company Foundation (2026-09-01): who at the Company is running this
  // campaign — selectable from the Company's own contacts only.
  const [editContactId, setEditContactId] = useState('');
  const [contacts, setContacts] = useState<BrandContact[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const loadFromCampaign = (c: Campaign) => {
    setCampaign(c);
    setEditStatus(c.status);
    setEditRewardPoints(String(c.rewardPoints));
    setEditTargetCount(String(c.targetCount));
    setEditStartDate(c.startDate ?? '');
    setEditEndDate(c.endDate ?? '');
    setEditDescription(c.description ?? '');
    setEditProductImage(c.productImage ?? '');
    setEditLocationName(c.locationName ?? '');
    setEditLocationAddress(c.locationAddress ?? '');
    setEditSurveyQuestions(c.surveyQuestions ?? []);
    setEditContactId(c.contactId ?? '');
  };

  useEffect(() => {
    companyApi.getContacts().then(setContacts).catch(() => setContacts([]));
  }, []);

  useEffect(() => {
    // Re-resolves whenever ?campaignId= changes — the route itself
    // (/campaign) doesn't remount on a query-string change alone, so this
    // effect must depend on location.search directly (same fix already
    // applied to Overview.tsx/Gallery.tsx). Without it, this page kept
    // showing whichever campaign it first loaded regardless of which
    // campaign the Company later navigated to — the exact bug reported.
    setLoading(true);
    setError('');
    setCampaign(null);
    setQrUrl(null);
    setQrError('');
    campaignApi
      .getSelected()
      .then((c) => {
        // Campaign resolved — render it immediately rather than waiting on
        // the QR image, and fetch the QR image as its own independent
        // operation so a QR-specific failure can't blank the whole page.
        loadFromCampaign(c);
        setLoading(false);
        qrApi
          .getQrImage(c.id)
          .then((blob) => setQrUrl(URL.createObjectURL(blob)))
          .catch(() =>
            setQrError('Could not generate the QR code image. Refresh this page to retry.'),
          );
      })
      .catch(() => {
        setError(
          'Could not load this campaign. It may have been removed, or you may no longer have access to it.',
        );
        setLoading(false);
      });
  }, [location.search]);

  const handleSave = () => {
    if (!campaign) return;
    if (
      editStatus !== campaign.status &&
      LIFECYCLE_ENDING_STATUSES.includes(editStatus) &&
      !window.confirm(
        `Set this campaign to ${editStatus.toUpperCase()}? It will stop appearing as an active ` +
          'trial to consumers. This can be changed back later.',
      )
    ) {
      return;
    }
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    const rewardPoints = Number(editRewardPoints);
    const targetCount = Number(editTargetCount);
    if (!Number.isFinite(rewardPoints) || rewardPoints < 0) {
      setSaveError('Reward points must be 0 or greater.');
      setSaving(false);
      return;
    }
    if (!Number.isFinite(targetCount) || targetCount < 1) {
      setSaveError('Target must be at least 1.');
      setSaving(false);
      return;
    }
    if (editStartDate && editEndDate && editEndDate < editStartDate) {
      setSaveError('End date cannot be earlier than start date.');
      setSaving(false);
      return;
    }
    campaignApi
      .update(campaign.id, {
        status: editStatus,
        rewardPoints,
        targetCount,
        startDate: editStartDate || undefined,
        endDate: editEndDate || undefined,
        description: editDescription,
        productImage: editProductImage || undefined,
        locationName: editLocationName || undefined,
        locationAddress: editLocationAddress || undefined,
        contactId: editContactId || undefined,
        surveyQuestions: editSurveyQuestions,
      })
      .then((updated) => {
        loadFromCampaign(updated);
        setSaveSuccess(true);
      })
      .catch((err) => {
        setSaveError(
          err?.response?.data?.message
            ? String(err.response.data.message)
            : 'Failed to save changes.',
        );
      })
      .finally(() => setSaving(false));
  };

  // Product Image upload (2026-09-02): applies immediately on selection —
  // same UX pattern as CompanyProfile's logo — rather than being staged
  // behind the "Save Changes" button below, so a Company sees the real
  // uploaded photo right away. The URL text field further down stays as an
  // explicit fallback (this architecture already treats productImage as a
  // plain URL string everywhere it's consumed — Consumer card/detail,
  // Report — so keeping it editable doesn't risk breaking anything, it
  // just becomes optional now that upload exists).
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !campaign) return;
    setImageError('');
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Only JPEG, PNG, or WebP images are allowed.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Image must be 4MB or smaller.');
      return;
    }
    setImageUploading(true);
    assetsApi
      .uploadCampaignProductImage(campaign.id, file)
      .then(({ productImage }) => {
        setCampaign((prev) => (prev ? { ...prev, productImage } : prev));
        setEditProductImage(productImage);
      })
      .catch((err) => {
        setImageError(
          err?.response?.data?.message ? String(err.response.data.message) : 'Upload failed.',
        );
      })
      .finally(() => setImageUploading(false));
  };

  const handleImageRemove = () => {
    if (!campaign || !window.confirm('Remove this product image?')) return;
    setImageUploading(true);
    assetsApi
      .removeCampaignProductImage(campaign.id)
      .then(() => {
        setCampaign((prev) => (prev ? { ...prev, productImage: '' } : prev));
        setEditProductImage('');
      })
      .catch(() => setImageError('Could not remove image.'))
      .finally(() => setImageUploading(false));
  };

  const handlePrint = () => {
    if (!qrUrl || !campaign) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>QR — ${campaign.brandName}</title>
      <style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:'Helvetica Neue',sans-serif;background:#fff;}
      img{width:280px;height:280px;} h2{font-size:18px;margin:16px 0 4px;} p{font-size:13px;color:#666;margin:0;}</style>
      </head><body>
      <h2>${campaign.brandName} — ${campaign.productName}</h2>
      <p>${campaign.locationName ?? ''}</p>
      <img src="${qrUrl}" alt="QR Code" style="margin:20px 0;" />
      <p style="font-size:11px;color:#999;">Scan to participate${campaign.isDemo ? ' · DEMO' : ''}</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  if (loading) return <div style={styles.muted}>Loading campaign…</div>;
  if (error) return <div style={styles.errMsg}>{error}</div>;
  if (!campaign) return null;

  return (
    <div>
      <div style={styles.header}>
        <div>
          {campaign.isDemo && <span style={styles.demoBadge}>DEMO CAMPAIGN</span>}
          <h1 style={styles.title}>Campaign Details</h1>
          <p style={styles.sub}>{campaign.productName} — details, survey configuration, and QR code</p>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.infoCard}>
          <div style={styles.cardTitle}>Campaign Identity</div>
          <InfoRow label="Brand" value={campaign.brandName} accent />
          <InfoRow label="Product" value={campaign.productName} />
          <InfoRow label="Location" value={campaign.locationName} />
          <InfoRow label="Address" value={campaign.locationAddress} />
          <InfoRow
            label="Status"
            value={campaign.status.toUpperCase() + (campaign.isDemo ? ' · DEMO' : '')}
            highlight={campaign.isDemo}
          />
          <InfoRow label="Target" value={`${campaign.targetCount} participants`} />
          <InfoRow label="Reward" value={`${campaign.rewardPoints} points`} />
          <InfoRow label="Period" value={`${campaign.startDate} → ${campaign.endDate}`} />
          {campaign.description && (
            <p style={styles.description}>{campaign.description}</p>
          )}

          <div style={styles.divider} />

          <div style={styles.cardTitle}>How This Campaign Works</div>
          {[
            ['TRIAL', 'Consumer receives product at activation point'],
            [
              'SIGNAL',
              // Never hardcode the question count — Survey Builder V2 lets a
              // Company add/remove custom questions per campaign, so this
              // must reflect the actual configured survey, not the 5-question
              // default every campaign started with.
              `Consumer scans QR → completes ${campaign.surveyQuestions?.length ?? 5}-question survey`,
            ],
            ['INTELLIGENCE', 'Platform structures data into insights'],
            ['DECISION', 'Brand acts on segment-level intelligence'],
          ].map(([label, desc]) => (
            <div key={label} style={styles.flowRow}>
              <div style={styles.flowLabel}>{label}</div>
              <div style={styles.flowDesc}>{desc}</div>
            </div>
          ))}
        </div>

        <div style={styles.qrCard}>
          <div style={styles.cardTitle}>Campaign QR Code</div>
          <div style={styles.qrWrap}>
            {qrUrl ? (
              <img src={qrUrl} alt="Campaign QR Code" style={styles.qrImg} />
            ) : qrError ? (
              <div style={styles.qrPlaceholder}>{qrError}</div>
            ) : (
              <div style={styles.qrPlaceholder}>Generating…</div>
            )}
          </div>
          <p style={styles.qrHint}>
            {campaign.isDemo
              ? 'Demo QR resets after each scan — reusable in meetings'
              : 'Scan to enter this campaign in the Tajribti app'}
          </p>
          <button style={styles.printBtn} onClick={handlePrint} disabled={!qrUrl}>
            Print QR
          </button>
          <div style={styles.qrInstructions}>
            {[
              'Open the Tajribti consumer app',
              'Tap "Scan QR" and point at this code',
              'Consumer completes the survey below',
              'Watch Overview update in real time',
            ].map((text, i) => (
              <div key={i} style={styles.instructionRow}>
                <span style={styles.instructionNum}>{i + 1}</span>
                <span style={styles.instructionText}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.manageCard}>
        <div style={styles.cardTitle}>Edit Campaign</div>
        <div style={styles.manageGrid}>
          <label style={styles.fieldLabel}>
            Status
            <select
              style={styles.select}
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <label style={styles.fieldLabel}>
            Reward Points
            <input
              style={styles.input}
              type="number"
              min={0}
              value={editRewardPoints}
              onChange={(e) => setEditRewardPoints(e.target.value)}
            />
          </label>
          <label style={styles.fieldLabel}>
            Target Participants
            <input
              style={styles.input}
              type="number"
              min={1}
              value={editTargetCount}
              onChange={(e) => setEditTargetCount(e.target.value)}
            />
          </label>
          <label style={styles.fieldLabel}>
            Start Date
            <input
              style={styles.input}
              type="date"
              value={editStartDate}
              onChange={(e) => setEditStartDate(e.target.value)}
            />
          </label>
          <label style={styles.fieldLabel}>
            End Date
            <input
              style={styles.input}
              type="date"
              value={editEndDate}
              onChange={(e) => setEditEndDate(e.target.value)}
            />
          </label>
          <label style={styles.fieldLabel}>
            Location Name
            <input
              style={styles.input}
              value={editLocationName}
              onChange={(e) => setEditLocationName(e.target.value)}
            />
          </label>
          <label style={styles.fieldLabel}>
            Location Address
            <input
              style={styles.input}
              value={editLocationAddress}
              onChange={(e) => setEditLocationAddress(e.target.value)}
            />
          </label>
          <label style={styles.fieldLabel}>
            Campaign Contact
            <select
              style={styles.select}
              value={editContactId}
              onChange={(e) => setEditContactId(e.target.value)}
            >
              <option value="">— None —</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.role ? ` (${c.role})` : ''}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label style={styles.fieldLabel}>
          Product Image
          <div style={styles.productImageRow}>
            {editProductImage ? (
              <img
                src={editProductImage}
                alt="Product"
                style={styles.productImagePreview}
                onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
              />
            ) : (
              <div style={styles.productImagePlaceholder}>No image</div>
            )}
            <div style={styles.productImageActions}>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />
              <button
                type="button"
                style={styles.logoBtn}
                disabled={imageUploading}
                onClick={() => imageInputRef.current?.click()}
              >
                {imageUploading ? 'Uploading…' : editProductImage ? 'Change' : 'Upload Image'}
              </button>
              {editProductImage && (
                <button type="button" style={styles.logoRemoveBtn} disabled={imageUploading} onClick={handleImageRemove}>
                  Remove
                </button>
              )}
            </div>
          </div>
          {imageError && <span style={styles.saveErr}>{imageError}</span>}
          <input
            style={styles.input}
            value={editProductImage}
            onChange={(e) => setEditProductImage(e.target.value)}
            placeholder="Or paste an image URL directly…"
          />
        </label>
        <label style={styles.fieldLabel}>
          Description
          <textarea
            style={styles.textarea}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={3}
          />
        </label>

        <div style={styles.divider} />

        <div style={styles.cardTitle}>Survey</div>
        <p style={styles.surveyHint}>
          What consumers are asked after they try this product. The 5 core questions can be
          reworded but keep their type (Survey Results, AI Insights, and Report depend on them) —
          their position can move freely. Add your own questions and use the ↑/↓ controls to
          place them anywhere in the survey, including ahead of a core question.
        </p>
        <SurveyEditor questions={editSurveyQuestions} onChange={setEditSurveyQuestions} />

        <div style={styles.manageActions}>
          <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saveSuccess && <span style={styles.saveSuccess}>Saved</span>}
          {saveError && <span style={styles.saveErr}>{saveError}</span>}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  accent,
  highlight,
}: {
  label: string;
  value: string;
  accent?: boolean;
  highlight?: boolean;
}) {
  return (
    <div style={infoStyles.row}>
      <span style={infoStyles.label}>{label}</span>
      <span
        style={{
          ...infoStyles.value,
          ...(accent ? infoStyles.accent : {}),
          ...(highlight ? infoStyles.highlight : {}),
        }}
      >
        {value}
      </span>
    </div>
  );
}

const infoStyles: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #0e1a2e',
  },
  label: { fontSize: 12, color: '#7a8bab', fontWeight: 500 },
  value: { fontSize: 13, color: '#4a5a7e', fontWeight: 500, textAlign: 'right' as const },
  accent: { color: '#0a1120', fontWeight: 700 },
  highlight: { color: '#b2f24d', fontWeight: 700, fontSize: 11, letterSpacing: 0.5 },
};

const styles: Record<string, React.CSSProperties> = {
  muted: { color: '#7a8bab', fontSize: 14, marginTop: 32 },
  errMsg: { color: '#dc2626', fontSize: 14, marginTop: 32 },
  header: { marginBottom: 24 },
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
    color: '#0a1120',
    margin: '4px 0 6px',
    letterSpacing: -0.3,
  },
  sub: { fontSize: 13, color: '#7a8bab', margin: 0 },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: 20,
    alignItems: 'start',
  },
  infoCard: {
    background: '#ffffff',
    border: '1px solid #e8ecf3',
    borderRadius: 16,
    padding: 28,
  },
  qrCard: {
    background: '#ffffff',
    border: '1px solid #e8ecf3',
    borderRadius: 16,
    padding: 28,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#7a8bab',
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: 'uppercase' as const,
  },
  description: {
    fontSize: 13,
    color: '#4a5a7e',
    lineHeight: 1.6,
    marginTop: 12,
    marginBottom: 0,
  },
  divider: { borderTop: '1px solid #e8ecf3', margin: '20px 0 16px' },
  flowRow: {
    display: 'flex',
    gap: 16,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  flowLabel: {
    fontSize: 9,
    fontWeight: 800,
    color: '#b2f24d',
    letterSpacing: 1.5,
    minWidth: 88,
    paddingTop: 2,
  },
  flowDesc: { fontSize: 12, color: '#4a5a7e', lineHeight: 1.5 },
  qrWrap: {
    background: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    marginTop: 4,
  },
  qrImg: { width: 200, height: 200, display: 'block' },
  qrPlaceholder: {
    width: 200,
    height: 200,
    background: '#f0f4fa',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#7a8bab',
    fontSize: 12,
  },
  qrHint: {
    fontSize: 10,
    color: '#7a8bab',
    margin: '0 0 16px',
    textAlign: 'center' as const,
  },
  printBtn: {
    background: 'transparent',
    border: '1px solid #dde3ee',
    color: '#4a5a7e',
    borderRadius: 8,
    padding: '9px 18px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: 20,
    width: '100%',
  },
  qrInstructions: {
    width: '100%',
    borderTop: '1px solid #e8ecf3',
    paddingTop: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  instructionRow: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  instructionNum: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#eef2f8',
    color: '#4a5a7e',
    fontSize: 10,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  instructionText: { fontSize: 12, color: '#4a5a7e', lineHeight: 1.5 },
  manageCard: {
    background: '#ffffff',
    border: '1px solid #e8ecf3',
    borderRadius: 16,
    padding: 28,
    marginTop: 20,
  },
  manageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 16,
  },
  fieldLabel: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
    fontSize: 11,
    fontWeight: 600,
    color: '#7a8bab',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  input: {
    background: '#f7f8fb',
    border: '1px solid #dde3ee',
    borderRadius: 8,
    padding: '9px 12px',
    color: '#0a1120',
    fontSize: 13,
    fontFamily: 'inherit',
  },
  select: {
    background: '#f7f8fb',
    border: '1px solid #dde3ee',
    borderRadius: 8,
    padding: '9px 12px',
    color: '#0a1120',
    fontSize: 13,
    fontFamily: 'inherit',
  },
  textarea: {
    background: '#f7f8fb',
    border: '1px solid #dde3ee',
    borderRadius: 8,
    padding: '9px 12px',
    color: '#0a1120',
    fontSize: 13,
    fontFamily: 'inherit',
    resize: 'vertical' as const,
  },
  productImageRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 },
  productImagePreview: {
    width: 64,
    height: 64,
    borderRadius: 10,
    objectFit: 'cover' as const,
    border: '1px solid #dde3ee',
    background: '#f7f8fb',
  },
  productImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 10,
    border: '1px dashed #cbd5e1',
    color: '#7a8bab',
    fontSize: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    flexShrink: 0,
  },
  productImageActions: { display: 'flex', gap: 8 },
  logoBtn: {
    background: 'transparent',
    border: '1px solid #dde3ee',
    color: '#374151',
    borderRadius: 8,
    padding: '8px 14px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  logoRemoveBtn: {
    background: 'transparent',
    border: '1px solid #dde3ee',
    color: '#dc2626',
    borderRadius: 8,
    padding: '8px 14px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  surveyHint: { fontSize: 12, color: '#4a5a7e', margin: '0 0 14px', lineHeight: 1.5 },
  surveyList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
    marginBottom: 20,
  },
  questionCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
    background: '#f7f8fb',
    border: '1px solid #e8ecf3',
    borderRadius: 10,
    padding: 14,
  },
  questionLabel: {
    fontSize: 10,
    fontWeight: 800,
    color: '#b2f24d',
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  manageActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  saveBtn: {
    background: '#b2f24d',
    border: 'none',
    color: '#040812',
    borderRadius: 8,
    padding: '10px 22px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
  saveSuccess: { fontSize: 12, color: '#b2f24d', fontWeight: 600 },
  saveErr: { fontSize: 12, color: '#dc2626', fontWeight: 600 },
};

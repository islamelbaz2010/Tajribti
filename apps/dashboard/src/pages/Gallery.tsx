import React, { useEffect, useState, FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { campaignApi, mediaApi } from '../api/endpoints';
import type { Campaign, CampaignMedia } from '../api/types';

// Campaign-scoped Media/Gallery — internal evidence layer (photos/videos
// from the trial location), not a public/social feature. Reuses the same
// campaign-selection pattern as every other campaign-scoped dashboard page
// (getSelected() / ?campaignId=), and the URL-reference pattern already
// used by Campaign.productImage — no new upload/storage subsystem.
export default function Gallery() {
  const location = useLocation();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [items, setItems] = useState<CampaignMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [type, setType] = useState<'photo' | 'video'>('photo');
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    campaignApi
      .getSelected()
      .then((c) => {
        setCampaign(c);
        return mediaApi.list(c.id);
      })
      .then(setItems)
      .catch(() => setError('Could not load this campaign’s media.'))
      .finally(() => setLoading(false));
  }, [location.search]);

  const refresh = (campaignId: string) => mediaApi.list(campaignId).then(setItems);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!campaign || !url.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await mediaApi.create(campaign.id, { type, url: url.trim(), caption: caption.trim() || undefined });
      setUrl('');
      setCaption('');
      await refresh(campaign.id);
    } catch {
      setError('Could not add this media item. Check the URL and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!campaign) return;
    await mediaApi.remove(campaign.id, mediaId);
    await refresh(campaign.id);
  };

  if (loading) return <div style={styles.loading}>Loading campaign media…</div>;
  if (!campaign) return <div style={styles.loading}>No campaign selected.</div>;

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Media / Gallery</h1>
        <p style={styles.sub}>
          {campaign.brandName} · {campaign.productName}
        </p>
      </div>

      <form onSubmit={handleAdd} style={styles.form}>
        <div style={styles.formRow}>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'photo' | 'video')}
            style={styles.select}
          >
            <option value="photo">Photo</option>
            <option value="video">Video</option>
          </select>
          <input
            style={{ ...styles.input, flex: 1 }}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Media URL (https://...)"
            required
          />
          <input
            style={{ ...styles.input, flex: 1 }}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional)"
          />
          <button type="submit" style={styles.addBtn} disabled={submitting || !url.trim()}>
            {submitting ? 'Adding…' : '+ Add'}
          </button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
      </form>

      {items.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyText}>No media added yet for this campaign.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {items.map((item) => (
            <div key={item.id} style={styles.card}>
              {item.type === 'photo' ? (
                <img src={item.url} alt={item.caption ?? ''} style={styles.thumb} />
              ) : (
                <video src={item.url} style={styles.thumb} controls />
              )}
              <div style={styles.cardFooter}>
                <span style={styles.badge}>{item.type.toUpperCase()}</span>
                {item.caption && <span style={styles.caption}>{item.caption}</span>}
                <button style={styles.deleteBtn} onClick={() => handleDelete(item.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: { color: '#2e3d5e', fontSize: 16, marginTop: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 800, color: '#edf0ff', margin: '0 0 4px', letterSpacing: -0.3 },
  sub: { fontSize: 13, color: '#6b7fa8', margin: 0 },
  form: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  formRow: { display: 'flex', gap: 10, flexWrap: 'wrap' as const },
  select: {
    background: '#070c1a',
    border: '1px solid #1a2540',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 13,
    color: '#edf0ff',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  input: {
    background: '#070c1a',
    border: '1px solid #1a2540',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    color: '#edf0ff',
    outline: 'none',
    minWidth: 180,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  addBtn: {
    background: '#b2f24d',
    color: '#040812',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
  },
  error: {
    fontSize: 12,
    color: '#fb7185',
    marginTop: 10,
    marginBottom: 0,
  },
  empty: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 16,
    padding: '48px 24px',
    textAlign: 'center' as const,
  },
  emptyText: { color: '#6b7fa8', fontSize: 13, margin: 0 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 16,
  },
  card: {
    background: '#0a1120',
    border: '1px solid #111d35',
    borderRadius: 14,
    overflow: 'hidden',
  },
  thumb: { width: '100%', height: 150, objectFit: 'cover' as const, display: 'block', background: '#070c1a' },
  cardFooter: {
    padding: 12,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    fontSize: 9,
    fontWeight: 800,
    color: '#b2f24d',
    background: 'rgba(178, 242, 77, 0.08)',
    border: '1px solid rgba(178, 242, 77, 0.2)',
    borderRadius: 4,
    padding: '2px 8px',
    letterSpacing: 1,
  },
  caption: { fontSize: 12, color: '#edf0ff' },
  deleteBtn: {
    alignSelf: 'flex-start',
    background: 'transparent',
    border: '1px solid #1a2540',
    color: '#6b7fa8',
    borderRadius: 6,
    padding: '5px 10px',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 2,
  },
};

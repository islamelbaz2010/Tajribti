import React, { createContext, useContext, useState, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import type { SurveyQuestion } from '../../api/types';

const API_BASE = process.env.REACT_APP_API_URL ?? 'http://localhost:3000/api/v1';

export interface ConsumerCampaign {
  id: string;
  brandName: string;
  productName: string;
  productImage: string | null;
  description: string | null;
  locationName: string | null;
  rewardPoints: number;
  surveyQuestions: SurveyQuestion[];
}

interface ConsumerJourneyState {
  campaign: ConsumerCampaign | null;
  campaignId: string;
  consumerToken: string | null;
  isNewUser: boolean;
  redemptionId: string | null;
  setConsumerToken: (token: string) => void;
  setIsNewUser: (v: boolean) => void;
  setRedemptionId: (id: string) => void;
}

const ConsumerJourneyContext = createContext<ConsumerJourneyState | null>(null);

export function useConsumerJourney(): ConsumerJourneyState {
  const ctx = useContext(ConsumerJourneyContext);
  if (!ctx) throw new Error('Must be inside JoinLayout');
  return ctx;
}

export async function consumerPost(path: string, body: unknown, token?: string | null) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? `Error ${res.status}`);
  return data.data ?? data;
}

export default function JoinLayout() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [campaign, setCampaign] = useState<ConsumerCampaign | null>(null);
  const [consumerToken, setConsumerToken] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [redemptionId, setRedemptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) return;
    fetch(`${API_BASE}/campaigns/${campaignId}`)
      .then((r) => r.json())
      .then((data) => {
        const c = data.data ?? data;
        if (!c?.id) throw new Error('Campaign not found');
        setCampaign(c as ConsumerCampaign);
      })
      .catch(() => setError('تعذر تحميل الحملة. يرجى التحقق من الرابط.'))
      .finally(() => setLoading(false));
  }, [campaignId]);

  if (loading) {
    return (
      <div style={s.centered}>
        <div style={s.spinner} />
      </div>
    );
  }

  if (error || !campaign || !campaignId) {
    return (
      <div style={s.centered}>
        <p style={s.errorText}>{error ?? 'الحملة غير موجودة.'}</p>
      </div>
    );
  }

  return (
    <ConsumerJourneyContext.Provider
      value={{
        campaign,
        campaignId,
        consumerToken,
        isNewUser,
        redemptionId,
        setConsumerToken,
        setIsNewUser,
        setRedemptionId,
      }}
    >
      <div style={s.shell} dir="rtl">
        <div style={s.card}>
          <Outlet />
        </div>
      </div>
    </ConsumerJourneyContext.Provider>
  );
}

const s: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: '100vh',
    background: '#f5f5f7',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '0 0 40px',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    background: '#ffffff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  centered: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f7',
  },
  spinner: {
    width: 36,
    height: 36,
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #1a1a2e',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorText: {
    color: '#e11d48',
    fontFamily: 'sans-serif',
    fontSize: 15,
    textAlign: 'center',
    padding: '0 24px',
  },
};

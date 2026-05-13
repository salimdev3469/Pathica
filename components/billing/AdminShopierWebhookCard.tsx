'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CoverageRow = {
  event: string;
  matched: boolean;
  matchingSubscriptionIds: string[];
  conflictingSubscriptionIds: string[];
};

type WebhookEventRow = {
  webhookId: string;
  event: string;
  status: string;
  errorMessage: string | null;
  receivedAt: string | null;
  processedAt: string | null;
};

type WebhookHealthPayload = {
  expectedUrl: string | null;
  requiredEvents: string[];
  patConfigured: boolean;
  patStatus: 'ok' | 'missing' | 'error';
  patCode: string | null;
  patMessage: string | null;
  envWebhookTokenCount: number;
  subscriptions: Array<{ id: string; event: string; url: string }>;
  coverage: CoverageRow[];
  recentEvents: WebhookEventRow[];
  error?: string;
};

type SyncPayload = {
  ok?: boolean;
  createdCount?: number;
  newWebhookTokens?: string[];
  newWebhookTokenCount?: number;
  error?: string;
  code?: string;
  health?: WebhookHealthPayload;
};

export default function AdminShopierWebhookCard() {
  const [data, setData] = useState<WebhookHealthPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string>('');
  const [tokenHint, setTokenHint] = useState<string>('');

  const patBadge = useMemo(() => {
    if (!data) return { label: 'Unknown', className: 'bg-slate-100 text-slate-700' };
    if (data.patStatus === 'ok') return { label: 'PAT OK', className: 'bg-emerald-100 text-emerald-700' };
    if (data.patStatus === 'missing') return { label: 'PAT Missing', className: 'bg-amber-100 text-amber-700' };
    return { label: 'PAT Error', className: 'bg-rose-100 text-rose-700' };
  }, [data]);

  const fetchHealth = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/billing/shopier/webhooks', { cache: 'no-store' });
      const payload = (await response.json().catch(() => ({}))) as WebhookHealthPayload;

      if (!response.ok) {
        setError(payload.error || 'Failed to load Shopier webhook health.');
        setData(null);
        return;
      }

      setData(payload);
    } catch {
      setError('Failed to load Shopier webhook health.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchHealth();
  }, []);

  const syncWebhooks = async () => {
    setIsSyncing(true);
    setError('');
    setTokenHint('');

    try {
      const response = await fetch('/api/admin/billing/shopier/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const payload = (await response.json().catch(() => ({}))) as SyncPayload;

      if (!response.ok || !payload.ok) {
        setError(payload.error || 'Webhook sync failed.');
        return;
      }

      if (payload.health) {
        setData(payload.health);
      } else {
        await fetchHealth();
      }

      const tokens = payload.newWebhookTokens || [];
      if (tokens.length > 0) {
        setTokenHint(tokens.join(','));
      }
    } catch {
      setError('Webhook sync failed.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Shopier Webhook Health</h2>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${patBadge.className}`}>{patBadge.label}</span>
          <Button variant="outline" size="sm" onClick={fetchHealth} disabled={isLoading || isSyncing}>
            Refresh
          </Button>
          <Button size="sm" onClick={syncWebhooks} disabled={isLoading || isSyncing}>
            {isSyncing ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
            Sync
          </Button>
        </div>
      </div>

      {error ? <p className="mb-3 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      {tokenHint ? (
        <div className="mb-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          New webhook token(s) returned by Shopier. Set `SHOPIER_WEBHOOK_TOKEN={tokenHint}` in your deployment env.
        </div>
      ) : null}

      {isLoading && !data ? (
        <p className="text-sm text-slate-600">Loading webhook status...</p>
      ) : null}

      {data ? (
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            Expected Notification URL: <span className="font-medium text-slate-900">{data.expectedUrl || '-'}</span>
          </p>
          <p>
            `SHOPIER_WEBHOOK_TOKEN` count in env: <span className="font-medium text-slate-900">{data.envWebhookTokenCount}</span>
          </p>
          {data.patMessage ? (
            <p className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              {data.patCode ? `${data.patCode}: ` : ''}
              {data.patMessage}
            </p>
          ) : null}

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-left uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-2 py-2">Event</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Matching IDs</th>
                  <th className="px-2 py-2">Conflicting IDs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.coverage.length === 0 ? (
                  <tr>
                    <td className="px-2 py-2" colSpan={4}>
                      No coverage data.
                    </td>
                  </tr>
                ) : (
                  data.coverage.map((row) => (
                    <tr key={row.event}>
                      <td className="px-2 py-2">{row.event}</td>
                      <td className="px-2 py-2">{row.matched ? 'matched' : 'missing'}</td>
                      <td className="px-2 py-2">{row.matchingSubscriptionIds.join(', ') || '-'}</td>
                      <td className="px-2 py-2">{row.conflictingSubscriptionIds.join(', ') || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-left uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-2 py-2">Received</th>
                  <th className="px-2 py-2">Event</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Webhook ID</th>
                  <th className="px-2 py-2">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentEvents.length === 0 ? (
                  <tr>
                    <td className="px-2 py-2" colSpan={5}>
                      No webhook events recorded yet.
                    </td>
                  </tr>
                ) : (
                  data.recentEvents.map((row) => (
                    <tr key={row.webhookId}>
                      <td className="px-2 py-2">{row.receivedAt ? new Date(row.receivedAt).toLocaleString() : '-'}</td>
                      <td className="px-2 py-2">{row.event}</td>
                      <td className="px-2 py-2">{row.status}</td>
                      <td className="px-2 py-2">{row.webhookId}</td>
                      <td className="px-2 py-2">{row.errorMessage || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}

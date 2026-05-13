'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type BillingReturnStatusProps = {
  paymentId?: string;
  orderId?: string;
};

type ReturnPayload = {
  error?: string;
  status?: string;
  message?: string;
  payment?: {
    id: string;
    status: string;
    packageCode: string;
    credits: number;
    priceUsd: number;
    buyerEmail: string;
    shopierOrderId: string | null;
    createdAt: string;
    paidAt: string | null;
    creditedAt: string | null;
  };
  wallet?: {
    creditBalance: number;
    freeExportsRemaining: number;
  } | null;
};

export default function BillingReturnStatus({ paymentId, orderId }: BillingReturnStatusProps) {
  const [data, setData] = useState<ReturnPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [manualOrderId, setManualOrderId] = useState(orderId || '');

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (paymentId) params.set('payment_id', paymentId);
    const resolvedOrderId = manualOrderId.trim() || orderId || '';
    if (resolvedOrderId) params.set('order_id', resolvedOrderId);
    return params.toString();
  }, [manualOrderId, orderId, paymentId]);

  const fetchStatus = useCallback(async () => {
    if (!query) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/billing/return?${query}`, { cache: 'no-store' });
      const payload = (await response.json().catch(() => ({}))) as ReturnPayload;
      setData(payload);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  if (!query) {
    return <p className="text-sm text-slate-600">Missing `payment_id` or `order_id` query parameter.</p>;
  }

  const shouldShowOrderIdInput = Boolean(paymentId) && (data?.payment?.status === 'pending' || data?.status === 'processing' || !data?.payment);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Payment Status</h2>
        <Button variant="outline" size="sm" onClick={fetchStatus} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {isLoading && !data ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Checking payment status...</div>
      ) : null}

      {data?.error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{data.error}</div>
      ) : null}

      {data?.message ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">{data.message}</div>
      ) : null}

      {shouldShowOrderIdInput ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-2 text-sm text-slate-700">
            If webhook is delayed, enter your Shopier <strong>order_id</strong> and verify this payment.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={manualOrderId}
              onChange={(event) => setManualOrderId(event.target.value)}
              placeholder="Shopier order_id (example: 468838843)"
            />
            <Button onClick={fetchStatus} disabled={isLoading || !manualOrderId.trim()}>
              Verify Order
            </Button>
          </div>
        </div>
      ) : null}

      {data?.payment ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Payment ID</dt>
              <dd className="font-medium text-slate-900">{data.payment.id}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Status</dt>
              <dd className="font-medium text-slate-900">{data.payment.status}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Package</dt>
              <dd className="font-medium text-slate-900">{data.payment.packageCode}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Credits</dt>
              <dd className="font-medium text-slate-900">{data.payment.credits}</dd>
            </div>
          </dl>
        </div>
      ) : null}

      {data?.wallet ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-800">
            Wallet balance: <strong>{data.wallet.creditBalance}</strong> credits · Free exports left:{' '}
            <strong>{data.wallet.freeExportsRemaining}</strong>
          </p>
        </div>
      ) : null}
    </div>
  );
}

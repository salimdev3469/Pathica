'use client';

import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatUsd } from '@/lib/billing-config';

type AdminPayment = {
  id: string;
  buyer_email: string;
  package_code: string;
  package_price_usd: number;
  credit_amount: number;
  status: string;
  shopier_order_id: string | null;
  created_at: string;
  paid_at: string | null;
  failure_reason: string | null;
};

type AdminPaymentsTableProps = {
  initialPayments: AdminPayment[];
};

type ApiPaymentsResponse = {
  payments?: AdminPayment[];
  error?: string;
};

export default function AdminPaymentsTable({ initialPayments }: AdminPaymentsTableProps) {
  const [payments, setPayments] = useState<AdminPayment[]>(initialPayments);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const sorted = useMemo(
    () => [...payments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [payments],
  );

  const refresh = async () => {
    setError('');
    const response = await fetch('/api/admin/billing/payments', { cache: 'no-store' });
    const payload = (await response.json().catch(() => ({}))) as ApiPaymentsResponse;

    if (!response.ok || !payload.payments) {
      setError(payload.error || 'Failed to refresh payment list.');
      return;
    }

    setPayments(payload.payments);
  };

  const approve = async (paymentId: string) => {
    setActiveId(paymentId);
    setError('');

    const response = await fetch(`/api/admin/billing/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setError(payload.error || 'Failed to approve payment.');
      setActiveId(null);
      return;
    }

    await refresh();
    setActiveId(null);
  };

  const reject = async (paymentId: string) => {
    setActiveId(paymentId);
    setError('');

    const response = await fetch(`/api/admin/billing/payments/${paymentId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'admin_rejected' }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setError(payload.error || 'Failed to reject payment.');
      setActiveId(null);
      return;
    }

    await refresh();
    setActiveId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Payments</h2>
        <Button variant="outline" size="sm" onClick={refresh} disabled={Boolean(activeId)}>
          Refresh
        </Button>
      </div>

      {error ? <p className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Package</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((payment) => {
              const isBusy = activeId === payment.id;
              const canApprove = payment.status !== 'credited' && payment.status !== 'rejected';
              const canReject = payment.status !== 'credited' && payment.status !== 'rejected';

              return (
                <tr key={payment.id}>
                  <td className="px-3 py-2 text-slate-700">{payment.buyer_email}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {payment.package_code} ({formatUsd(Number(payment.package_price_usd))}) / {payment.credit_amount}
                  </td>
                  <td className="px-3 py-2 text-slate-700">{payment.status}</td>
                  <td className="px-3 py-2 text-slate-700">{payment.shopier_order_id || '-'}</td>
                  <td className="px-3 py-2 text-slate-700">{new Date(payment.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => approve(payment.id)} disabled={!canApprove || isBusy}>
                        {isBusy ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => reject(payment.id)} disabled={!canReject || isBusy}>
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

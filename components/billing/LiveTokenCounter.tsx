'use client';

import { useCallback, useEffect, useState } from 'react';
import { Coins, Download, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type WalletPayload = {
  wallet?: {
    creditBalance: number;
    freeExportsRemaining: number;
  };
  error?: string;
};

type LiveTokenCounterProps = {
  initialCredits?: number;
  initialFreeExports?: number;
  compact?: boolean;
};

export default function LiveTokenCounter({
  locale = 'en',
  initialCredits,
  initialFreeExports,
  compact = false,
}: LiveTokenCounterProps) {
  const hasInitialValues = typeof initialCredits === 'number' && typeof initialFreeExports === 'number';
  const fetchErrorText = 'Could not fetch token counter.';
  const formatter = new Intl.NumberFormat(false ? 'tr-TR' : 'en-US');

  const [credits, setCredits] = useState<number>(initialCredits ?? 0);
  const [freeExports, setFreeExports] = useState<number>(initialFreeExports ?? 0);
  const [isLoading, setIsLoading] = useState(!hasInitialValues);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string>('');

  const refreshWallet = useCallback(async (silent = false) => {
    if (!silent) {
      setIsRefreshing(true);
    }

    try {
      const response = await fetch('/api/billing/wallet', { cache: 'no-store' });
      const payload = (await response.json().catch(() => ({}))) as WalletPayload;

      if (!response.ok || !payload.wallet) {
        setError(payload.error || fetchErrorText);
        return;
      }

      setCredits(payload.wallet.creditBalance);
      setFreeExports(payload.wallet.freeExportsRemaining);
      setError('');
    } catch {
      setError(fetchErrorText);
    } finally {
      setIsLoading(false);
      if (!silent) {
        setIsRefreshing(false);
      }
    }
  }, [fetchErrorText]);

  useEffect(() => {
    void refreshWallet(true);

    const timer = setInterval(() => {
      void refreshWallet(true);
    }, 15000);

    return () => clearInterval(timer);
  }, [refreshWallet]);

  if (compact) {
    return (
      <div className="inline-flex h-9 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-[#111827] shadow-sm transition hover:bg-slate-50" title={'Available credits'}>
        <Coins className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-bold tabular-nums">
          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : formatter.format(credits)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <div className="inline-flex h-9 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-[#111827] shadow-sm">
        <Coins className="h-4 w-4 text-blue-600" />
        <span className="text-xs font-semibold text-gray-600">{'Credits'}</span>
        <span className="text-sm font-bold tabular-nums text-[#111827]">
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : formatter.format(credits)}
        </span>
      </div>
      {freeExports > 0 && (
        <div className="inline-flex h-9 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-[#111827] shadow-sm">
          <Download className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-semibold text-gray-600">{'Exports'}</span>
          <span className="text-sm font-bold tabular-nums text-[#111827]">
            {isLoading ? '-' : formatter.format(freeExports)}
          </span>
        </div>
      )}
      <div className="inline-flex h-9 cursor-pointer items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-4 text-xs font-bold text-blue-600 transition hover:bg-blue-100">
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        {'Upgrade'}
      </div>
      {error ? <p className="w-full text-xs text-red-600 font-semibold">{error}</p> : null}
    </div>
  );
}

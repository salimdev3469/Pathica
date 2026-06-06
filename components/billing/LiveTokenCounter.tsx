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
      <div className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-white shadow-sm transition hover:bg-white/10" title={'Available credits'}>
        <Coins className="h-4 w-4 text-blue-400" />
        <span className="text-sm font-bold tabular-nums">
          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : formatter.format(credits)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-white">
        <Coins className="h-4 w-4 text-white/50" />
        <span className="text-xs text-white/50">{'Available credits'}</span>
        <span className="text-xl font-semibold leading-none tabular-nums text-white">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : formatter.format(credits)}
        </span>
      </div>
      <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-white">
        <Download className="h-4 w-4 text-white/50" />
        <span className="text-xs text-white/50">{'Free exports left'}</span>
        <span className="text-xl font-semibold leading-none tabular-nums text-white">
          {isLoading ? '-' : formatter.format(freeExports)}
        </span>
      </div>
      <div className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-blue-500/50 bg-blue-600/10 px-4 text-sm font-medium text-blue-400 transition hover:bg-blue-600/20">
        <Plus className="mr-2 h-4 w-4" />
        {'Add Credit'}
      </div>
      {error ? <p className="w-full text-xs text-white/60">{error}</p> : null}
    </div>
  );
}

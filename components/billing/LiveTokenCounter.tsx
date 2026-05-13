'use client';

import { useCallback, useEffect, useState } from 'react';
import { Coins, Download, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type WalletPayload = {
  wallet?: {
    creditBalance: number;
    freeExportsRemaining: number;
  };
  error?: string;
};

type LiveTokenCounterProps = {
  locale?: 'en' | 'tr';
  initialCredits?: number;
  initialFreeExports?: number;
};

export default function LiveTokenCounter({
  locale = 'en',
  initialCredits,
  initialFreeExports,
}: LiveTokenCounterProps) {
  const isTr = locale === 'tr';
  const t = (en: string, tr: string) => (isTr ? tr : en);
  const hasInitialValues = typeof initialCredits === 'number' && typeof initialFreeExports === 'number';
  const fetchErrorText = t('Could not fetch token counter.', 'Token sayacı alınamadı.');
  const formatter = new Intl.NumberFormat(isTr ? 'tr-TR' : 'en-US');

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

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
        <Coins className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <span className="text-xs text-slate-500 dark:text-slate-400">{t('Available credits', 'Kullanılabilir kredi')}</span>
        <span className="text-xl font-semibold leading-none tabular-nums text-slate-900 dark:text-slate-100">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : formatter.format(credits)}
        </span>
      </div>

      <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
        <Download className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <span className="text-xs text-slate-500 dark:text-slate-400">{t('Free exports left', 'Kalan ücretsiz export')}</span>
        <span className="text-xl font-semibold leading-none tabular-nums text-slate-900 dark:text-slate-100">
          {isLoading ? '-' : formatter.format(freeExports)}
        </span>
      </div>

      <Button
        variant="outline"
        onClick={() => void refreshWallet(false)}
        disabled={isRefreshing || isLoading}
        className="h-10 rounded-lg border-slate-200 bg-white px-4 text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
        {t('Refresh', 'Yenile')}
      </Button>

      {error ? <p className="w-full text-xs text-slate-600 dark:text-slate-300">{error}</p> : null}
    </div>
  );
}

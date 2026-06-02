import Link from 'next/link';
import { Coins } from 'lucide-react';
import LiveTokenCounter from '@/components/billing/LiveTokenCounter';
import { Button } from '@/components/ui/button';
import { getBillingSummaryText, type WalletSnapshot } from '@/lib/billing';
import type { Locale } from '@/lib/locale';

type DashboardBillingBarProps = {
  locale: Locale;
  wallet: Pick<WalletSnapshot, 'creditBalance' | 'freeExportsRemaining'>;
  billingSchemaMissing?: boolean;
};

export default function DashboardBillingBar({ locale, wallet, billingSchemaMissing = false }: DashboardBillingBarProps) {
  const t = (en: string, tr: string) => (locale === 'tr' ? tr : en);

  return (
    <section className="mb-5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <LiveTokenCounter
          locale={locale}
          initialCredits={wallet.creditBalance}
          initialFreeExports={wallet.freeExportsRemaining}
        />

        <div className="flex w-full gap-2 sm:w-auto">
          <Button asChild className="h-10 min-w-[158px] justify-center gap-2 rounded-lg bg-slate-900 px-4 text-white shadow-sm transition hover:bg-black dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
            <Link href="/billing">
              <Coins className="h-4 w-4" />
              {t('Buy Credits', 'Kredi Satın Al')}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-10 min-w-[158px] justify-center rounded-lg border-slate-200 bg-white px-4 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Link href="/billing">{t('Open Billing', 'Faturalamayı Aç')}</Link>
          </Button>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{getBillingSummaryText(locale)}</p>
      {billingSchemaMissing ? (
        <p className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          Billing şeması henüz uygulanmamış: `supabase/schema.sql` dosyasını SQL Editor’da çalıştırın.
        </p>
      ) : null}
    </section>
  );
}

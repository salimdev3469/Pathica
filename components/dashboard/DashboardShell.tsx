import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Brain, FileText, Mail, Coins } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';
import LiveTokenCounter from '@/components/billing/LiveTokenCounter';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/lib/locale';
import type { WalletSnapshot } from '@/lib/billing';

type DashboardShellProps = {
  active: 'resumes' | 'coverLetters' | 'aiReview';
  userEmail?: string | null;
  locale: Locale;
  wallet?: Pick<WalletSnapshot, 'creditBalance' | 'freeExportsRemaining'>;
  billingSchemaMissing?: boolean;
  children: ReactNode;
};

const NAV_ITEMS = [
  { id: 'resumes', href: '/dashboard', labelEn: 'Resumes', labelTr: 'CV’ler', icon: FileText },
  { id: 'coverLetters', href: '/dashboard/cover-letters', labelEn: 'Cover Letters', labelTr: 'Ön Yazılar', icon: Mail },
  { id: 'aiReview', href: '/dashboard/ai-review', labelEn: 'AI Review', labelTr: 'AI Review', icon: Brain },
] as const;

export default function DashboardShell({ active, userEmail, locale, wallet, billingSchemaMissing, children }: DashboardShellProps) {
  const t = (en: string, tr: string) => (locale === 'tr' ? tr : en);

  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#05070b]/85 backdrop-blur-xl">
        <div className="mx-auto flex min-h-24 w-full max-w-[1400px] flex-col gap-3 px-4 py-3 sm:px-6 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo_pathica_footer.png" alt={t('Pathica logo', 'Pathica logosu')} width={144} height={144} className="h-20 w-20 object-contain sm:h-24 sm:w-24" />
            </Link>

            <div className="2xl:hidden">
              <LogoutButton locale={locale} className="h-10 rounded-xl border border-white/10 px-3 text-xs bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors" />
            </div>
          </div>

          <nav className="flex min-w-0 gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] p-1 shadow-sm hide-scrollbar">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === active;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition sm:px-4 ${
                    isActive
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/90'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {locale === 'tr' ? item.labelTr : item.labelEn}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {wallet && (
              <div className="flex flex-wrap items-center gap-2">
                <LiveTokenCounter
                  locale={locale}
                  initialCredits={wallet.creditBalance}
                  initialFreeExports={wallet.freeExportsRemaining}
                />
                <div className="flex items-center gap-2">
                  <Button asChild className="h-10 justify-center gap-2 rounded-lg bg-blue-600 px-4 text-white shadow-sm transition hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">
                    <Link href="/billing">
                      <Coins className="h-4 w-4" />
                      {t('Buy Credits', 'Kredi Satın Al')}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 justify-center rounded-lg border-white/10 bg-white/5 px-4 text-white shadow-sm hover:bg-white/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    <Link href="/billing">{t('Billing', 'Faturalama')}</Link>
                  </Button>
                </div>
              </div>
            )}
            
            <div className="hidden items-center gap-3 2xl:flex">
              <LogoutButton locale={locale} className="h-10 rounded-xl border border-white/10 px-3 text-xs bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6">
        {billingSchemaMissing ? (
          <p className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Billing şeması henüz uygulanmamış: `supabase/schema.sql` dosyasını SQL Editor’da çalıştırın.
          </p>
        ) : null}
        {children}
      </main>
    </div>
  );
}

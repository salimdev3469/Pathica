import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Brain, FileText, Mail } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';
import LiveTokenCounter from '@/components/billing/LiveTokenCounter';
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
      <header className="border-b border-white/5 bg-transparent">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="shrink-0">
              <Image src="/logo_pathica_footer.png" alt={t('Pathica logo', 'Pathica logosu')} width={200} height={200} className="h-10 w-auto object-contain sm:h-16 lg:h-20" />
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              {wallet && (
                <>
                  <div className="hidden lg:block">
                    <Link href="/billing">
                      <LiveTokenCounter
                        locale={locale}
                        initialCredits={wallet.creditBalance}
                        initialFreeExports={wallet.freeExportsRemaining}
                        compact={false}
                      />
                    </Link>
                  </div>
                  <div className="lg:hidden">
                    <Link href="/billing">
                      <LiveTokenCounter
                        locale={locale}
                        initialCredits={wallet.creditBalance}
                        initialFreeExports={wallet.freeExportsRemaining}
                        compact={true}
                      />
                    </Link>
                  </div>
                </>
              )}
              <LogoutButton locale={locale} className="h-10 rounded-xl border border-white/10 px-3 sm:px-4 text-xs sm:text-sm font-medium bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors" />
            </div>
          </div>

          <nav className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === active;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex h-10 shrink-0 whitespace-nowrap items-center gap-2 rounded-full px-5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-white text-black'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {locale === 'tr' ? item.labelTr : item.labelEn}
                </Link>
              );
            })}
          </nav>
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

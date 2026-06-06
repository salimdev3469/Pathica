import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Brain, FileText, Mail } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';
import LiveTokenCounter from '@/components/billing/LiveTokenCounter';
import ThemeToggle from '@/components/theme-toggle';
import type { WalletSnapshot } from '@/lib/billing';

type DashboardShellProps = {
  active: 'resumes' | 'coverLetters' | 'aiReview';
  userEmail?: string | null;
  userName?: string | null;
  wallet?: Pick<WalletSnapshot, 'creditBalance' | 'freeExportsRemaining'>;
  billingSchemaMissing?: boolean;
  children: ReactNode;
};

const NAV_ITEMS = [
  { id: 'resumes', href: '/dashboard', labelEn: 'Resumes', labelTr: 'CV’ler', icon: FileText },
  { id: 'coverLetters', href: '/dashboard/cover-letters', labelEn: 'Cover Letters', labelTr: 'Ön Yazılar', icon: Mail },
  { id: 'aiReview', href: '/dashboard/ai-review', labelEn: 'AI Review', labelTr: 'AI Review', icon: Brain },
] as const;

export default function DashboardShell({
  active,
  userEmail,
  userName,
  wallet,
  billingSchemaMissing,
  children
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      <header className="border-b border-white/5 bg-transparent">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="shrink-0">
              <Image src="/logo_pathica_footer.png" alt={'Pathica logo'} width={200} height={200} className="h-16 w-auto object-contain sm:h-20" />
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              {wallet && (
                <>
                  <div className="hidden lg:block">
                    <Link href="/billing">
                      <LiveTokenCounter
                        initialCredits={wallet.creditBalance}
                        initialFreeExports={wallet.freeExportsRemaining}
                        compact={false} />
                    </Link>
                  </div>
                  <div className="lg:hidden">
                    <Link href="/billing">
                      <LiveTokenCounter
                        initialCredits={wallet.creditBalance}
                        initialFreeExports={wallet.freeExportsRemaining}
                        compact={true} />
                    </Link>
                  </div>
                </>
              )}
              {userName ? (
                <div className="flex items-center gap-2 sm:gap-3 rounded-xl border border-white/10 bg-white/5 pl-3 sm:pl-4 pr-1.5 py-1.5">
                  <span className="max-w-[100px] sm:max-w-[150px] truncate text-xs sm:text-sm font-medium text-white/90">{userName}</span>
                  <LogoutButton
                    className="h-7 sm:h-8 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-300 px-2 sm:px-3 text-[10px] sm:text-xs transition-colors text-white/70" />
                </div>
              ) : (
                <LogoutButton
                  className="h-10 rounded-xl border border-white/10 px-3 sm:px-4 text-xs sm:text-sm font-medium bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors" />
              )}
            </div>
          </div>

          <nav className="flex items-center justify-between gap-1 sm:gap-2 pb-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === active;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex h-10 flex-1 justify-center whitespace-nowrap items-center gap-1.5 rounded-full px-1 text-[11px] sm:text-sm sm:px-5 font-semibold transition ${
                    isActive
                      ? 'bg-white text-black'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="truncate">{item.labelEn}</span>
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
      <div className="fixed bottom-5 right-5 z-[100]">
        <ThemeToggle />
      </div>
    </div>
  );
}

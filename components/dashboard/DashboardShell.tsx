import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Brain, FileText, Mail } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';
import type { Locale } from '@/lib/locale';

type DashboardShellProps = {
  active: 'resumes' | 'coverLetters' | 'aiReview';
  userEmail?: string | null;
  locale: Locale;
  children: ReactNode;
};

const NAV_ITEMS = [
  { id: 'resumes', href: '/dashboard', labelEn: 'Resumes', labelTr: 'CV’ler', icon: FileText },
  { id: 'coverLetters', href: '/dashboard/cover-letters', labelEn: 'Cover Letters', labelTr: 'Ön Yazılar', icon: Mail },
  { id: 'aiReview', href: '/dashboard/ai-review', labelEn: 'AI Review', labelTr: 'AI Review', icon: Brain },
] as const;

export default function DashboardShell({ active, userEmail, locale, children }: DashboardShellProps) {
  const t = (en: string, tr: string) => (locale === 'tr' ? tr : en);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex min-h-24 w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo_pathica.png" alt={t('Pathica logo', 'Pathica logosu')} width={144} height={144} className="h-20 w-20 object-contain dark:hidden sm:h-24 sm:w-24" />
              <Image src="/logo_pathica_footer.png" alt={t('Pathica dark logo', 'Pathica koyu logosu')} width={144} height={144} className="hidden h-20 w-20 object-contain dark:block sm:h-24 sm:w-24" />
            </Link>

            <div className="lg:hidden">
              <LogoutButton locale={locale} className="h-10 rounded-xl border border-slate-200 px-3 text-xs dark:border-slate-700" />
            </div>
          </div>

          <nav className="flex min-w-0 gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white/80 p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === active;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition sm:px-4 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-950'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {locale === 'tr' ? item.labelTr : item.labelEn}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="max-w-[240px] truncate rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {userEmail || t('Signed in', 'Giriş yapıldı')}
            </div>
            <LogoutButton locale={locale} className="h-10 rounded-xl border border-slate-200 px-3 text-xs dark:border-slate-700" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6">{children}</main>
    </div>
  );
}

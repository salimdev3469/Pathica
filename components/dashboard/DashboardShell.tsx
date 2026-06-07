'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Brain, FileText, Mail, User, LogOut } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';
import LiveTokenCounter from '@/components/billing/LiveTokenCounter';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] selection:bg-blue-100">
      <header className="border-b border-[#E5E7EB] bg-white/60 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-4 sm:px-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
              <Image src="/logo_pathica.png" alt={'Pathica logo'} width={200} height={200} className="h-14 w-auto object-contain sm:h-16" />
            </Link>

            <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:flex-nowrap sm:justify-end sm:gap-4">
              {wallet && (
                <Link href="/billing" className="hover:opacity-90 transition-opacity">
                  <LiveTokenCounter
                    initialCredits={wallet.creditBalance}
                    initialFreeExports={wallet.freeExportsRemaining}
                    compact={false} />
                </Link>
              )}
              {userName || userEmail ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white pl-3 pr-2 py-1.5 shadow-sm transition hover:border-blue-200 hover:bg-blue-50">
                      <span className="max-w-[120px] truncate text-sm font-semibold text-[#111827]">
                        {userName || userEmail}
                      </span>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <User className="h-3 w-3" />
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-48 rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-lg">
                    <div className="mb-2 px-2 py-1.5">
                      <p className="text-xs font-medium text-[#4B5563]">Signed in as</p>
                      <p className="truncate text-sm font-bold text-[#111827]">{userEmail}</p>
                    </div>
                    <div className="h-px w-full bg-[#E5E7EB] my-1" />
                    <LogoutButton
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50" 
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </LogoutButton>
                  </PopoverContent>
                </Popover>
              ) : (
                <LogoutButton
                  className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-blue-50 hover:text-blue-600" 
                />
              )}
            </div>
          </div>

          <nav className="flex items-center justify-center gap-2 sm:justify-start">
            <div className="flex items-center rounded-full bg-white p-1 shadow-sm border border-[#E5E7EB]">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === active;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex h-9 items-center gap-2 rounded-full px-4 text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-[#4B5563] hover:bg-slate-50 hover:text-[#111827]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.labelEn}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6">
        {billingSchemaMissing ? (
          <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Billing şeması henüz uygulanmamış: `supabase/schema.sql` dosyasını SQL Editor’da çalıştırın.
          </p>
        ) : null}
        {children}
      </main>
    </div>
  );
}

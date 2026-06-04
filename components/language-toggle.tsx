'use client';

import { useTransition, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Locale, setClientLocale } from '@/lib/locale';
import { ChevronDown } from 'lucide-react';

type LanguageToggleProps = {
  locale: Locale;
  className?: string;
  tone?: 'light' | 'dark';
};

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '/en.png' },
  { code: 'tr', label: 'Türkçe', flag: '/tr.png' },
];

export default function LanguageToggle({ locale, className, tone = 'light' }: LanguageToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const effectiveLocale = pendingLocale ?? locale;

  const current = LANGUAGES.find((l) => l.code === effectiveLocale) ?? LANGUAGES[0];

  const handleChange = (nextLocale: Locale) => {
    setOpen(false);
    if (nextLocale === effectiveLocale) return;

    setPendingLocale(nextLocale);
    setClientLocale(nextLocale);

    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    refreshTimerRef.current = setTimeout(() => {
      startTransition(() => {
        router.refresh();
      });
    }, 120);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (pendingLocale && pendingLocale === locale) {
      setPendingLocale(null);
    }
  }, [locale, pendingLocale]);

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        type="button"
        disabled={isPending}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-3 py-1.5 shadow-sm transition',
          tone === 'dark'
            ? 'border border-white/12 bg-white/[0.03] hover:border-white/18 hover:bg-white/[0.06]'
            : 'border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
          isPending && 'opacity-60 cursor-not-allowed',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language selector"
      >
        <Image
          src={current.flag}
          alt={current.label}
          width={20}
          height={14}
          className="rounded-sm object-cover"
          style={{ width: 20, height: 14 }}
        />
        <span className={cn('text-xs font-medium', tone === 'dark' ? 'text-white/80' : 'text-slate-700')}>
          {current.code.toUpperCase()}
        </span>
        <ChevronDown
          className={cn(
            'h-3 w-3 transition-transform',
            tone === 'dark' ? 'text-white/45' : 'text-slate-500',
            open && 'rotate-180',
          )}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          className={cn(
            'absolute right-0 z-50 mt-1.5 min-w-[120px] overflow-hidden rounded-xl shadow-lg',
            tone === 'dark' ? 'border border-white/12 bg-[#0d1018]' : 'border border-slate-200 bg-white',
          )}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              role="option"
              aria-selected={lang.code === effectiveLocale}
              type="button"
              disabled={isPending}
              onClick={() => handleChange(lang.code)}
              className={cn(
                'flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition',
                tone === 'dark' ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50',
                lang.code === effectiveLocale
                  ? tone === 'dark'
                    ? 'bg-white/[0.06] font-semibold text-white'
                    : 'bg-slate-100 font-semibold text-slate-900'
                  : tone === 'dark'
                    ? 'text-white/75'
                    : 'text-slate-700',
                isPending && 'cursor-not-allowed opacity-60',
              )}
            >
              <Image
                src={lang.flag}
                alt={lang.label}
                width={22}
                height={16}
                className="rounded-sm object-cover"
                style={{ width: 22, height: 16 }}
              />
              <span>{lang.label}</span>
              {lang.code === effectiveLocale && (
                <span className={cn('ml-auto', tone === 'dark' ? 'text-sky-300' : 'text-primary')}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

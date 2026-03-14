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
};

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '/en.png' },
  { code: 'tr', label: 'Türkçe', flag: '/tr.png' },
];

export default function LanguageToggle({ locale, className }: LanguageToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  const handleChange = (nextLocale: Locale) => {
    setOpen(false);
    if (nextLocale === locale) return;
    setClientLocale(nextLocale);
    startTransition(() => {
      router.refresh();
    });
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

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        type="button"
        disabled={isPending}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition',
          'hover:border-slate-300 hover:bg-slate-50',
          'dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800',
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
        <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
          {current.code.toUpperCase()}
        </span>
        <ChevronDown
          className={cn(
            'h-3 w-3 text-slate-500 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          className={cn(
            'absolute right-0 z-50 mt-1.5 min-w-[120px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg',
            'dark:border-slate-700 dark:bg-slate-900',
          )}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              role="option"
              aria-selected={lang.code === locale}
              type="button"
              onClick={() => handleChange(lang.code)}
              className={cn(
                'flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition',
                'hover:bg-slate-50 dark:hover:bg-slate-800',
                lang.code === locale
                  ? 'bg-slate-100 font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                  : 'text-slate-700 dark:text-slate-300',
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
              {lang.code === locale && (
                <span className="ml-auto text-primary">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
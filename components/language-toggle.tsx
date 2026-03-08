'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Locale, setClientLocale } from '@/lib/locale';

type LanguageToggleProps = {
  locale: Locale;
  className?: string;
};

export default function LanguageToggle({ locale, className }: LanguageToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      return;
    }

    setClientLocale(nextLocale);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900',
        className,
      )}
      aria-label="Language selector"
    >
      <Button
        type="button"
        size="sm"
        variant={locale === 'en' ? 'default' : 'ghost'}
        className="h-8 rounded-full px-3 text-xs"
        disabled={isPending}
        onClick={() => handleChange('en')}
      >
        EN
      </Button>
      <Button
        type="button"
        size="sm"
        variant={locale === 'tr' ? 'default' : 'ghost'}
        className="h-8 rounded-full px-3 text-xs"
        disabled={isPending}
        onClick={() => handleChange('tr')}
      >
        TR
      </Button>
    </div>
  );
}
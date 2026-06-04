import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type HeroIntroProps = {
  eyebrow: ReactNode;
  headline: ReactNode;
  subtitle: ReactNode;
  className?: string;
  eyebrowClassName?: string;
  headingClassName?: string;
  subtitleClassName?: string;
};

export function HeroIntro({
  eyebrow,
  headline,
  subtitle,
  className,
  eyebrowClassName,
  headingClassName,
  subtitleClassName,
}: HeroIntroProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <p
        className={cn(
          'inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200',
          eyebrowClassName,
        )}
      >
        {eyebrow}
      </p>
      <h1
        className={cn(
          'max-w-4xl text-4xl font-semibold leading-[0.92] tracking-[-0.06em] text-slate-950 dark:text-slate-50 sm:text-5xl lg:text-[4.4rem]',
          headingClassName,
        )}
      >
        {headline}
      </h1>
      <p
        className={cn(
          'max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300 md:text-xl',
          subtitleClassName,
        )}
      >
        {subtitle}
      </p>
    </div>
  );
}

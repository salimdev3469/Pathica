'use client';

import { useState } from 'react';
import { Typewriter } from '@/components/ui/typewriter-text';

type HeroIntroProps = {
  headline: string;
  subtitle: string;
};

export function HeroIntro({ headline, subtitle }: HeroIntroProps) {
  const [showSubtitle, setShowSubtitle] = useState(false);

  return (
    <>
      <h1 className="mb-8 min-h-[110px] text-5xl leading-tight tracking-[-0.04em] text-slate-900 dark:text-slate-100 sm:min-h-[150px] lg:text-7xl">
        <Typewriter
          text={headline}
          speed={50}
          loop={false}
          hideCursorOnComplete
          onComplete={() => setShowSubtitle(true)}
        />
      </h1>

      <p
        className={[
          'mb-10 mx-auto max-w-2xl text-xl leading-relaxed text-slate-600',
          'transition-all duration-700 ease-out',
          showSubtitle ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
        ].join(' ')}
      >
        {subtitle}
      </p>
    </>
  );
}
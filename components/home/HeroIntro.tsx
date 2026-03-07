'use client';

import { useState } from 'react';
import { Typewriter } from '@/components/ui/typewriter-text';

export function HeroIntro() {
  const [showSubtitle, setShowSubtitle] = useState(false);

  return (
    <>
      <h1 className="text-5xl lg:text-7xl tracking-[-0.04em] text-[#1a1a1a] mb-8 leading-tight min-h-[110px] sm:min-h-[150px]">
        <Typewriter
          text="Land Your Dream Job with an AI-Optimized CV"
          speed={50}
          loop={false}
          hideCursorOnComplete
          onComplete={() => setShowSubtitle(true)}
        />
      </h1>

      <p
        className={[
          'text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed',
          'transition-all duration-700 ease-out',
          showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none',
        ].join(' ')}
      >
        Create ATS-friendly resumes that get past the bots. Tailor your applications to specific roles and track your success all in one powerful platform.
      </p>
    </>
  );
}

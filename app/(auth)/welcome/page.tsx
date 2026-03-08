'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextShimmer } from '@/components/ui/text-shimmer';

const LINES = [
  'Setting up your dashboard...',
  'Making everything ready for you...',
  'Welcome',
] as const;

export default function WelcomeTransitionPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    router.prefetch('/dashboard');

    const showSecond = setTimeout(() => setCurrentIndex(1), 1400);
    const showThird = setTimeout(() => setCurrentIndex(2), 2800);
    const goDashboard = setTimeout(() => {
      router.replace('/dashboard');
    }, 4200);

    return () => {
      clearTimeout(showSecond);
      clearTimeout(showThird);
      clearTimeout(goDashboard);
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center overflow-visible bg-white px-6">
      <div className="flex flex-col items-center gap-6 overflow-visible text-center">
        <TextShimmer
          key={LINES[currentIndex]}
          as="p"
          duration={1.1}
          className="py-2 text-5xl font-semibold leading-[1.25] md:text-6xl [--base-color:#2563eb] [--base-gradient-color:#93c5fd]"
        >
          {LINES[currentIndex]}
        </TextShimmer>
      </div>
    </div>
  );
}

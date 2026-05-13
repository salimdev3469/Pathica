'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TextShimmer } from '@/components/ui/text-shimmer';

const LINES = [
  'Setting up your dashboard...',
  'Making everything ready for you...',
  'Welcome',
] as const;

export default function WelcomeTransitionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canShow, setCanShow] = useState<boolean | null>(null);
  const next = searchParams.get('next') || '/dashboard';

  useEffect(() => {
    let isMounted = true;

    const authorizeWelcome = async () => {
      try {
        const response = await fetch('/api/auth/welcome/consume', {
          method: 'POST',
          cache: 'no-store',
        });
        const payload = (await response.json().catch(() => ({}))) as { allow?: boolean };
        const allow = Boolean(payload.allow);

        if (!isMounted) return;

        if (!allow) {
          router.replace(next);
          return;
        }

        setCanShow(true);
      } catch {
        if (!isMounted) return;
        router.replace(next);
      }
    };

    void authorizeWelcome();

    return () => {
      isMounted = false;
    };
  }, [next, router]);

  useEffect(() => {
    if (!canShow) {
      return;
    }

    router.prefetch(next);

    const showSecond = setTimeout(() => setCurrentIndex(1), 1400);
    const showThird = setTimeout(() => setCurrentIndex(2), 2800);
    const goDashboard = setTimeout(() => {
      router.replace(next);
    }, 4200);

    return () => {
      clearTimeout(showSecond);
      clearTimeout(showThird);
      clearTimeout(goDashboard);
    };
  }, [canShow, next, router]);

  if (canShow !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <TextShimmer
          as="p"
          duration={1.1}
          className="py-2 text-3xl font-semibold leading-[1.25] [--base-color:#2563eb] [--base-gradient-color:#93c5fd]"
        >
          Loading...
        </TextShimmer>
      </div>
    );
  }

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

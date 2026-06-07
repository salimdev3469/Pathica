'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TextShimmer } from '@/components/ui/text-shimmer';

const LINES = [
  'Setting up your dashboard...',
  'Creating your personalized workspace...',
  'Optimizing AI models for you...',
  'Almost there, getting things ready...'
];

export default function WelcomeTransitionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const next = searchParams.get('next') || '/dashboard';
  const lines = LINES;

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
      } catch {
        if (!isMounted) return;
        router.replace(next);
      }
    };

    void authorizeWelcome();
    router.prefetch(next);

    let index = 0;
    const interval = setInterval(() => {
      setIsFading(true);
      
      setTimeout(() => {
        if (!isMounted) return;
        index++;
        if (index >= lines.length) {
          router.replace(next);
          return;
        }
        setCurrentIndex(index);
        setIsFading(false);
      }, 1000);

    }, 3200);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [next, router, lines.length]);

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-white px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <div
          className={`transition-all duration-1000 ease-in-out ${
            isFading ? 'opacity-0 blur-md scale-95' : 'opacity-100 blur-0 scale-100'
          }`}
        >
          <TextShimmer
            as="p"
            duration={2}
            className="py-2 text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.25] [--base-color:#2563eb] [--base-gradient-color:#93c5fd]"
          >
            {lines[currentIndex]}
          </TextShimmer>
        </div>
      </div>
    </div>
  );
}

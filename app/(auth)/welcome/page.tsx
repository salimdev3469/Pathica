'use client';;
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TextShimmer } from '@/components/ui/text-shimmer';

const LINES_BY_LOCALE: Record<Locale, readonly [string, string, string]> = {
  en: ['Setting up your dashboard...', 'Making everything ready for you...', 'Welcome'],
  tr: ['Panelinizi hazırlıyoruz...', 'Her şeyi sizin için ayarlıyoruz...', 'Hoş geldiniz'],
};

export default function WelcomeTransitionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [locale, setLocale] = useState<Locale>('en');
  const next = searchParams.get('next') || '/dashboard';
  const lines = LINES_BY_LOCALE[locale];

  useEffect(() => {
    setLocale(getClientLocale());
  }, []);

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

    const showSecond = setTimeout(() => setCurrentIndex(1), 1400);
    const showThird = setTimeout(() => setCurrentIndex(2), 2800);
    const goDashboard = setTimeout(() => {
      router.replace(next);
    }, 4200);

    return () => {
      isMounted = false;
      clearTimeout(showSecond);
      clearTimeout(showThird);
      clearTimeout(goDashboard);
    };
  }, [next, router]);

  return (
    <div className="flex min-h-screen items-center justify-center overflow-visible bg-white px-6">
      <div className="flex flex-col items-center gap-6 overflow-visible text-center">
        <TextShimmer
          key={lines[currentIndex]}
          as="p"
          duration={1.1}
          className="py-2 text-5xl font-semibold leading-[1.25] md:text-6xl [--base-color:#2563eb] [--base-gradient-color:#93c5fd]"
        >
          {lines[currentIndex]}
        </TextShimmer>
      </div>
    </div>
  );
}

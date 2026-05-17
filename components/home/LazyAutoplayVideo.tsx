'use client';

import { useEffect, useRef, useState } from 'react';

type LazyAutoplayVideoProps = {
  src: string;
  className?: string;
};

export default function LazyAutoplayVideo({ src, className }: LazyAutoplayVideoProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || shouldLoad) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) {
          return;
        }

        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className="w-full">
      {shouldLoad ? (
        <video autoPlay loop muted playsInline preload="metadata" src={src} className={className} />
      ) : (
        <div className="aspect-video w-full animate-pulse bg-slate-100 dark:bg-slate-800" aria-hidden="true" />
      )}
    </div>
  );
}

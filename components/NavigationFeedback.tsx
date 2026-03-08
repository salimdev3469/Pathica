'use client';

import { Loader2 } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function NavigationFeedback() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  const routeKey = useMemo(() => {
    const search = searchParams?.toString() || '';
    return `${pathname}?${search}`;
  }, [pathname, searchParams]);

  // Stop only when the route actually changes.
  useEffect(() => {
    setIsNavigating(false);
  }, [routeKey]);

  useEffect(() => {
    const handleClickCapture = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;

      if (!anchor) {
        return;
      }

      if (anchor.target && anchor.target !== '_self') {
        return;
      }

      const href = anchor.getAttribute('href') || '';
      if (!href) {
        return;
      }

      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:')
      ) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (nextUrl.origin !== currentUrl.origin) {
        return;
      }

      // Ignore same-page/hash-only navigation.
      const isSameDocumentNavigation =
        nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search;

      if (isSameDocumentNavigation) {
        return;
      }

      setIsNavigating(true);
    };

    document.addEventListener('click', handleClickCapture, true);

    return () => {
      document.removeEventListener('click', handleClickCapture, true);
    };
  }, []);

  if (!isNavigating) {
    return null;
  }

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-transparent"
        aria-hidden="true"
      >
        <div className="h-full w-1/3 animate-[nav-load_1.05s_ease-in-out_infinite] bg-blue-600" />
      </div>

      <div className="pointer-events-none fixed right-4 top-4 z-[100] rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading page...
        </div>
      </div>
    </>
  );
}

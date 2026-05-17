'use client';

import type { Locale } from '@/lib/locale';
import { COOKIE_CONSENT_OPEN_PANEL_EVENT } from '@/lib/cookie-consent';

type CookieSettingsButtonProps = {
  locale: Locale;
};

export default function CookieSettingsButton({ locale }: CookieSettingsButtonProps) {
  const isTr = locale === 'tr';

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_PANEL_EVENT))}
      className="text-sm underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
    >
      {isTr ? 'Çerez Tercihleri' : 'Cookie Preferences'}
    </button>
  );
}

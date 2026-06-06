'use client';;
import { COOKIE_CONSENT_OPEN_PANEL_EVENT } from '@/lib/cookie-consent';

type CookieSettingsButtonProps = {};

export default function CookieSettingsButton({}: CookieSettingsButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_PANEL_EVENT))}
      className="text-sm underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
    >
      {false ? 'Çerez Tercihleri' : 'Cookie Preferences'}
    </button>
  );
}

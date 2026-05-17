'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Locale } from '@/lib/locale';
import {
  COOKIE_CONSENT_COOKIE_NAME,
  COOKIE_CONSENT_OPEN_PANEL_EVENT,
  buildCookieConsentPreferences,
  getClientCookieValue,
  parseCookieConsentPreferences,
  serializeCookieConsentPreferences,
  setClientCookie,
} from '@/lib/cookie-consent';

type CookieConsentBannerProps = {
  locale: Locale;
  initialConsentValue: string | null;
};

export default function CookieConsentBanner({ locale, initialConsentValue }: CookieConsentBannerProps) {
  const isTr = locale === 'tr';
  const t = (en: string, tr: string) => (isTr ? tr : en);
  const initialPreferences = useMemo(
    () => parseCookieConsentPreferences(initialConsentValue),
    [initialConsentValue],
  );

  const [isOpen, setIsOpen] = useState(() => initialPreferences === null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(() => initialPreferences?.analytics ?? false);
  const [marketingEnabled, setMarketingEnabled] = useState(() => initialPreferences?.marketing ?? false);

  useEffect(() => {
    const handleOpenPanel = () => {
      const latest = parseCookieConsentPreferences(getClientCookieValue(COOKIE_CONSENT_COOKIE_NAME));
      if (latest) {
        setAnalyticsEnabled(latest.analytics);
        setMarketingEnabled(latest.marketing);
      }
      setShowPreferences(true);
      setIsOpen(true);
    };

    window.addEventListener(COOKIE_CONSENT_OPEN_PANEL_EVENT, handleOpenPanel);
    return () => window.removeEventListener(COOKIE_CONSENT_OPEN_PANEL_EVENT, handleOpenPanel);
  }, []);

  const savePreferences = (analytics: boolean, marketing: boolean) => {
    const next = buildCookieConsentPreferences({ analytics, marketing });
    const value = serializeCookieConsentPreferences(next);
    setClientCookie(COOKIE_CONSENT_COOKIE_NAME, value);
    setAnalyticsEnabled(next.analytics);
    setMarketingEnabled(next.marketing);
    setShowPreferences(false);
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <section className="fixed inset-x-0 bottom-0 z-[120] border-t border-slate-200 bg-white/95 shadow-2xl backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-900">
              {t('Cookie Preferences', 'Çerez Tercihleri')}
            </h2>
            <p className="text-xs leading-5 text-slate-700">
              {t(
                'We use necessary cookies for login, security, and core site functions. Optional analytics and marketing cookies are used only with your consent.',
                'Giriş, güvenlik ve temel site işlevleri için zorunlu çerezler kullanıyoruz. Analitik ve pazarlama çerezleri yalnızca açık onayınızla çalışır.',
              )}{' '}
              <Link href="/cerez-politikasi" className="font-medium text-slate-900 underline underline-offset-2">
                {t('Cookie Policy', 'Çerez Politikası')}
              </Link>
              .
            </p>
          </div>

          {showPreferences ? (
            <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <label className="flex items-center justify-between gap-4 text-xs text-slate-700">
                <span>{t('Necessary cookies (always active)', 'Zorunlu çerezler (her zaman aktif)')}</span>
                <input
                  type="checkbox"
                  checked
                  disabled
                  aria-label={t('Necessary cookies always active', 'Zorunlu çerezler her zaman aktif')}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900"
                />
              </label>

              <label className="flex items-center justify-between gap-4 text-xs text-slate-700">
                <span>{t('Analytics cookies', 'Analitik çerezler')}</span>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(event) => setAnalyticsEnabled(event.target.checked)}
                  aria-label={t('Analytics cookies', 'Analitik çerezler')}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
              </label>

              <label className="flex items-center justify-between gap-4 text-xs text-slate-700">
                <span>{t('Marketing cookies', 'Pazarlama çerezleri')}</span>
                <input
                  type="checkbox"
                  checked={marketingEnabled}
                  onChange={(event) => setMarketingEnabled(event.target.checked)}
                  aria-label={t('Marketing cookies', 'Pazarlama çerezleri')}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
              </label>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => savePreferences(true, true)}
              className="h-9 rounded-md border border-slate-300 bg-white px-4 text-xs font-medium text-slate-800 transition hover:bg-slate-100"
            >
              {t('Accept all', 'Hepsini kabul et')}
            </button>

            <button
              type="button"
              onClick={() => savePreferences(false, false)}
              className="h-9 rounded-md border border-slate-300 bg-white px-4 text-xs font-medium text-slate-800 transition hover:bg-slate-100"
            >
              {t('Reject optional', 'Sadece zorunlu')}
            </button>

            <button
              type="button"
              onClick={() => (showPreferences ? savePreferences(analyticsEnabled, marketingEnabled) : setShowPreferences(true))}
              className="h-9 rounded-md border border-slate-300 bg-white px-4 text-xs font-medium text-slate-800 transition hover:bg-slate-100"
            >
              {showPreferences ? t('Save preferences', 'Tercihleri kaydet') : t('Preferences', 'Tercihler')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

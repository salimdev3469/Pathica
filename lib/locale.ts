export type Locale = 'en' | 'tr';

export const LOCALE_COOKIE_NAME = 'pathica_locale';

export function normalizeLocale(value: string | null | undefined): Locale {
  return value === 'tr' ? 'tr' : 'en';
}

export function getClientLocale(): Locale {
  if (typeof document === 'undefined') {
    return 'en';
  }

  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${LOCALE_COOKIE_NAME}=`))
    ?.split('=')[1];

  return normalizeLocale(match);
}

export function setClientLocale(locale: Locale) {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
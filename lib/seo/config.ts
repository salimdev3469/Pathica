import type { Metadata } from 'next';
import type { Locale } from '@/lib/locale';

export const SEO_LOCALES: readonly Locale[] = ['en', 'tr'];
export const DEFAULT_SEO_LOCALE: Locale = 'en';

export const SITE_NAME = 'Pathica';
export const SITE_DOMAIN_FALLBACK = 'https://www.pathica.tech';

export const PRICING_MESSAGE = {
  en: 'Build free. Preview free. Pay only when you export.',
  tr: 'Ücretsiz oluştur. Ücretsiz önizle. Sadece export alırken öde.',
} as const;

export function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || SITE_DOMAIN_FALLBACK).replace(/\/$/, '');
}

export function toAbsoluteUrl(pathname: string): string {
  const normalizedPathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${getBaseUrl()}${normalizedPathname}`;
}

export function isSeoLocale(value: string): value is Locale {
  return SEO_LOCALES.includes(value as Locale);
}

export function localizedPath(locale: Locale, slug = ''): string {
  const normalizedSlug = slug.replace(/^\/+/, '');
  return normalizedSlug ? `/${locale}/${normalizedSlug}` : `/${locale}`;
}

export function localeAlternates(
  paths: Record<Locale, string>,
  canonicalLocale: Locale = DEFAULT_SEO_LOCALE,
): NonNullable<Metadata['alternates']> {
  return {
    canonical: paths[canonicalLocale],
    languages: {
      en: paths.en,
      tr: paths.tr,
      'x-default': paths[DEFAULT_SEO_LOCALE],
    },
  };
}

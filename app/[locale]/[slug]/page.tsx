import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SeoLandingPageView from '@/components/seo/SeoLandingPage';
import { isSeoLocale, localeAlternates, toAbsoluteUrl } from '@/lib/seo/config';
import { getSeoLandingAlternates, getSeoLandingPage, getSeoLandingStaticParams } from '@/lib/seo/landing-pages';

interface SeoLandingRouteProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return getSeoLandingStaticParams();
}

export function generateMetadata({ params }: SeoLandingRouteProps): Metadata {
  if (!isSeoLocale(params.locale)) {
    return {};
  }

  const page = getSeoLandingPage(params.locale, params.slug);
  if (!page) {
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const alternates = getSeoLandingAlternates(page.key);

  return {
    title: page.title,
    description: page.description,
    keywords: [page.primaryKeyword, ...page.secondaryKeywords],
    alternates: localeAlternates(alternates, params.locale),
    openGraph: {
      type: 'website',
      title: page.title,
      description: page.description,
      url: alternates[params.locale],
      locale: params.locale,
      alternateLocale: [params.locale === 'tr' ? 'en' : 'tr'],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
    },
    other: {
      'og:site_name': 'Pathica',
      'x-default-url': toAbsoluteUrl(alternates.en),
    },
  };
}

export default function SeoLandingRoutePage({ params }: SeoLandingRouteProps) {
  if (!isSeoLocale(params.locale)) {
    notFound();
  }

  const page = getSeoLandingPage(params.locale, params.slug);
  if (!page) {
    notFound();
  }

  const alternates = getSeoLandingAlternates(page.key);

  return <SeoLandingPageView page={page} alternates={alternates} />;
}

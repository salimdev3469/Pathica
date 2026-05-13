import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isSeoLocale, localeAlternates, localizedPath, PRICING_MESSAGE, toAbsoluteUrl } from '@/lib/seo/config';
import { getSeoLandingPagesByLocale } from '@/lib/seo/landing-pages';
import { getProfessionListPath } from '@/lib/seo/professions';

interface LocaleHubPageProps {
  params: {
    locale: string;
  };
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'tr' }];
}

export function generateMetadata({ params }: LocaleHubPageProps): Metadata {
  if (!isSeoLocale(params.locale)) {
    return {};
  }

  const locale = params.locale;
  const isTr = locale === 'tr';

  return {
    title: isTr ? 'CV Oluşturma Merkezi' : 'Resume Builder Hub',
    description: isTr
      ? 'CV oluşturma, ATS uyumu, şablonlar ve meslek bazlı örnekler için içerik merkezi.'
      : 'Content hub for resume building, ATS optimization, templates, and role-based examples.',
    alternates: localeAlternates({
      en: localizedPath('en'),
      tr: localizedPath('tr'),
    }, locale),
    openGraph: {
      type: 'website',
      url: localizedPath(locale),
      title: isTr ? 'CV Oluşturma Merkezi | Pathica' : 'Resume Builder Hub | Pathica',
      description: isTr
        ? 'CV ve ATS odaklı içerik merkezinden doğru sayfaya hızlıca ulaşın.'
        : 'Find the right resume and ATS-focused page quickly from a structured content hub.',
    },
  };
}

export default function LocaleHubPage({ params }: LocaleHubPageProps) {
  if (!isSeoLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale;
  const isTr = locale === 'tr';
  const landingPages = getSeoLandingPagesByLocale(locale);
  const programmaticPath = getProfessionListPath(locale);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: isTr ? 'CV SEO İçerik Merkezi' : 'Resume SEO Content Hub',
    inLanguage: locale,
    url: toAbsoluteUrl(localizedPath(locale)),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        ...landingPages.map((page, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: page.h1,
          url: toAbsoluteUrl(localizedPath(locale, page.slug)),
        })),
        {
          '@type': 'ListItem',
          position: landingPages.length + 1,
          name: isTr ? 'Meslek Bazlı CV Örnekleri' : 'Role-Based Resume Examples',
          url: toAbsoluteUrl(programmaticPath),
        },
      ],
    },
  };

  return (
    <main lang={locale} className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
            {isTr ? 'SEO İçerik Mimarisi' : 'SEO Content Architecture'}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900 md:text-5xl">
            {isTr ? 'CV ve Resume Landing Page Merkezi' : 'CV and Resume Landing Page Hub'}
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-slate-600">
            {isTr
              ? 'Arama niyetine göre hazırlanmış landing page’ler, ATS odaklı içerikler ve programmatic meslek sayfalarına buradan erişin.'
              : 'Explore search-intent landing pages, ATS-focused content, and scalable programmatic role pages.'}
          </p>
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-700">
            <p className="font-medium">{PRICING_MESSAGE[locale]}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 md:grid-cols-2">
          {landingPages.map((page) => (
            <article key={page.slug} className="rounded-2xl border bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-900">{page.h1}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{page.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border bg-slate-50 px-3 py-1 text-xs text-slate-700">{page.primaryKeyword}</span>
              </div>
              <Link
                href={localizedPath(locale, page.slug)}
                className="mt-6 inline-flex h-10 items-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-900"
              >
                {isTr ? 'Sayfayı Aç' : 'Open Page'}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-2xl border bg-white p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            {isTr ? 'Programmatic Meslek Bazlı Sayfalar' : 'Programmatic Role-Based Pages'}
          </h2>
          <p className="mt-3 text-sm text-slate-700">
            {isTr
              ? 'Yüzlerce meslek sayfası üretimine uygun veri modeli ile her rol için ayrı örnek sayfalar.'
              : 'A scalable data model that supports hundreds of profession-specific example pages.'}
          </p>
          <Link
            href={programmaticPath}
            className="mt-6 inline-flex h-11 items-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-black"
          >
            {isTr ? 'Meslek Sayfalarını Gör' : 'Browse Role Pages'}
          </Link>
        </div>
      </section>
    </main>
  );
}

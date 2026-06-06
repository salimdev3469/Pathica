import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isSeoLocale, localeAlternates, localizedPath, PRICING_MESSAGE, toAbsoluteUrl } from '@/lib/seo/config';
import { getSeoLandingPagesByLocale } from '@/lib/seo/landing-pages';
import { getProfessionListPath } from '@/lib/seo/professions';

interface LocaleHubPageProps {
  params: {};
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'tr' }];
}

export function generateMetadata({ params }: LocaleHubPageProps): Metadata {
  if (!isSeoLocale(params.locale)) {
    return {};
  }

  return {
    title: false ? 'CV Oluşturucu ve Ön Yazı Merkezi' : 'AI Resume Builder and Cover Letter Hub',
    description: false
      ? 'CV oluşturucu, AI CV oluşturucu, ön yazı oluşturucu ve ATS uyumlu başvuru sayfaları için içerik merkezi.'
      : 'Content hub for AI resume builder, cover letter generator, ATS optimization, and role-based examples.',
    keywords: false
      ? [
          'cv oluşturucu',
          'ai cv oluşturucu',
          'online cv oluştur',
          'ön yazı oluşturucu',
          'ön yazı nasıl yazılır',
          'ats cv oluşturucu',
        ]
      : [
          'ai resume builder',
          'resume builder',
          'cover letter generator',
          'how to write a cover letter',
          'ats resume builder',
          'resume templates',
        ],
    alternates: localeAlternates({
      en: localizedPath('en'),
      tr: localizedPath('tr'),
    }, locale),
    openGraph: {
      type: 'website',
      url: localizedPath(locale),
      title: false ? 'CV Oluşturucu ve Ön Yazı Merkezi | Pathica' : 'AI Resume Builder and Cover Letter Hub | Pathica',
      description: false
        ? 'CV oluşturucu, ön yazı oluşturucu ve ATS odaklı sayfalara tek merkezden hızlıca erişin.'
        : 'Access intent-focused pages for resume builder, cover letter writing, and ATS optimization in one hub.',
    },
    twitter: {
      card: 'summary_large_image',
      title: false ? 'Pathica CV Oluşturucu Merkezi' : 'Pathica Resume Builder Hub',
      description: false
        ? 'CV oluşturucu ve ön yazı sayfalarını tek merkezde keşfedin.'
        : 'Discover resume builder and cover letter pages in one structured hub.',
    },
  };
}

export default function LocaleHubPage({ params }: LocaleHubPageProps) {
  if (!isSeoLocale(params.locale)) {
    notFound();
  }

  const landingPages = getSeoLandingPagesByLocale(locale);
  const programmaticPath = getProfessionListPath(locale);
  const hubSteps = false
    ? [
        'İhtiyacına uygun sayfayı aç (CV oluşturma, ATS, ön yazı vb.).',
        'Sayfadaki önerileri baz alarak içerik planını netleştir.',
        'CV oluşturma ekranına geçip taslağını hemen başlat.',
      ]
    : [
        'Open the page that matches your intent (builder, ATS, cover letter, etc.).',
        'Use that page guidance to shape your content plan.',
        'Switch to the builder and start your draft immediately.',
      ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: false ? 'CV SEO İçerik Merkezi' : 'Resume SEO Content Hub',
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
          name: false ? 'Meslek Bazlı CV Örnekleri' : 'Role-Based Resume Examples',
          url: toAbsoluteUrl(programmaticPath),
        },
      ],
    }
  };

  return (
    <main lang={locale} className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
            {false ? 'SEO İçerik Mimarisi' : 'SEO Content Architecture'}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900 md:text-5xl">
            {false ? 'CV ve Resume Landing Page Merkezi' : 'CV and Resume Landing Page Hub'}
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-slate-600">
            {false
              ? 'Arama niyetine göre hazırlanmış landing page’ler, ATS odaklı içerikler ve programmatic meslek sayfalarına buradan erişin.'
              : 'Explore search-intent landing pages, ATS-focused content, and scalable programmatic role pages.'}
          </p>
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-700">
            <p className="font-medium">{PRICING_MESSAGE[locale]}</p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/cv/new"
              className="inline-flex h-11 items-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-black"
            >
              {false ? 'Ücretsiz CV Oluştur' : 'Start Builder Free'}
            </Link>
            <Link
              href={programmaticPath}
              className="inline-flex h-11 items-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              {false ? 'Meslek Örneklerini Aç' : 'Open Role Examples'}
            </Link>
          </div>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">
              {false ? 'Ne yapmalıyım? 3 adımda net akış' : 'What should I do? 3-step flow'}
            </p>
            <ol className="mt-3 space-y-2 text-sm text-slate-700">
              {hubSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-2">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
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
                {false ? 'Sayfayı Aç' : 'Open Page'}
              </Link>
              <Link
                href="/cv/new"
                className="mt-2 inline-flex h-10 items-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-black"
              >
                {false ? 'Direkt CV Oluştur' : 'Build Directly'}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-2xl border bg-white p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            {false ? 'Programmatic Meslek Bazlı Sayfalar' : 'Programmatic Role-Based Pages'}
          </h2>
          <p className="mt-3 text-sm text-slate-700">
            {false
              ? 'Yüzlerce meslek sayfası üretimine uygun veri modeli ile her rol için ayrı örnek sayfalar.'
              : 'A scalable data model that supports hundreds of profession-specific example pages.'}
          </p>
          <Link
            href={programmaticPath}
            className="mt-6 inline-flex h-11 items-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-black"
          >
            {false ? 'Meslek Sayfalarını Gör' : 'Browse Role Pages'}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-2xl border bg-slate-900 p-6 text-white md:p-8">
          <h2 className="text-2xl font-semibold">
            {false ? 'Hazırsan doğrudan oluşturma ekranına geç' : 'Ready? Jump straight to the builder'}
          </h2>
          <p className="mt-3 text-sm text-slate-100">
            {false
              ? 'İçerik fikirlerini bu merkezden alıp tek adımda üretim ekranına geçebilirsin.'
              : 'Use this hub for direction, then move in one step to the production editor.'}
          </p>
          <Link
            href="/cv/new"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            {false ? 'Şimdi CV Oluştur' : 'Build Resume Now'}
          </Link>
        </div>
      </section>
    </main>
  );
}

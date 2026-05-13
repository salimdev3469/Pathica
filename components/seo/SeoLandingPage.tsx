import Link from 'next/link';
import type { Locale } from '@/lib/locale';
import type { SeoLandingPage } from '@/lib/seo/landing-pages';
import { PRICING_MESSAGE, SITE_NAME, toAbsoluteUrl } from '@/lib/seo/config';

type SeoLandingPageProps = {
  locale: Locale;
  page: SeoLandingPage;
  alternates: Record<Locale, string>;
};

export default function SeoLandingPageView({ locale, page, alternates }: SeoLandingPageProps) {
  const isTr = locale === 'tr';
  const pageUrl = toAbsoluteUrl(alternates[locale]);

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.h1,
      description: page.description,
      inLanguage: locale,
      url: pageUrl,
      isPartOf: {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: toAbsoluteUrl('/'),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: isTr ? 'SEO Sayfaları' : 'SEO Pages',
          item: toAbsoluteUrl(`/${locale}`),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: page.h1,
          item: pageUrl,
        },
      ],
    },
  ];

  return (
    <main lang={locale} className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-14 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
            {isTr ? 'Arama Niyeti Odaklı Sayfa' : 'Search-Intent Landing Page'}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900 md:text-5xl">
            {page.h1}
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-slate-600">{page.intro}</p>

          <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-700">
            <p className="font-medium">{PRICING_MESSAGE[locale]}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="rounded-full border bg-white px-3 py-1 font-medium">{page.primaryKeyword}</span>
            {page.secondaryKeywords.map((keyword) => (
              <span key={keyword} className="rounded-full border bg-white px-3 py-1">
                {keyword}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={page.ctaHref}
              className="inline-flex h-11 items-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-black"
            >
              {page.ctaLabel}
            </Link>
            <Link
              href={isTr ? '/tr/cv-ornekleri' : '/en/resume-examples'}
              className="inline-flex h-11 items-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              {isTr ? 'Meslek Bazlı Örnekler' : 'Role-Based Examples'}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-2xl border bg-white p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">{isTr ? 'Bu Sayfa Ne Sağlar?' : 'What This Page Delivers'}</h2>
          <p className="mt-4 text-slate-700">{page.searchIntent}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-12 md:grid-cols-3">
        {page.sections.map((section) => (
          <article key={section.title} className="rounded-2xl border bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{section.body}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-2xl border bg-white p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">{isTr ? 'Sık Sorulan Sorular' : 'Frequently Asked Questions'}</h2>
          <div className="mt-6 space-y-5">
            {page.faq.map((item) => (
              <article key={item.question}>
                <h3 className="text-lg font-semibold text-slate-900">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

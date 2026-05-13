import Link from 'next/link';
import type { Locale } from '@/lib/locale';
import type { ProfessionSeed } from '@/lib/seo/professions';
import { getProfessionListPath, getProfessionPath } from '@/lib/seo/professions';
import { PRICING_MESSAGE, toAbsoluteUrl } from '@/lib/seo/config';

type ProgrammaticProfessionDetailPageProps = {
  locale: Locale;
  profession: ProfessionSeed;
};

export default function ProgrammaticProfessionDetailPage({ locale, profession }: ProgrammaticProfessionDetailPageProps) {
  const isTr = locale === 'tr';
  const pageUrl = toAbsoluteUrl(getProfessionPath(locale, profession.slug));

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: isTr
        ? `${profession.roleName.tr} CV Örneği`
        : `${profession.roleName.en} Resume Example`,
      description: profession.summary[locale],
      inLanguage: locale,
      url: pageUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: isTr
        ? `${profession.roleName.tr} için CV hazırlama adımları`
        : `How to write a ${profession.roleName.en} resume`,
      step: [
        {
          '@type': 'HowToStep',
          name: isTr ? 'Rol odaklı özet yaz' : 'Write a role-specific summary',
          text: profession.summary[locale],
        },
        {
          '@type': 'HowToStep',
          name: isTr ? 'Kritik yetkinlikleri ekle' : 'Add role-relevant skills',
          text: profession.coreSkills[locale].join(', '),
        },
        {
          '@type': 'HowToStep',
          name: isTr ? 'Ölçülebilir başarıları göster' : 'Show measurable outcomes',
          text: profession.achievementIdeas[locale].join(' '),
        },
      ],
    },
  ];

  return (
    <main lang={locale} className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
            {isTr ? 'Meslek Bazlı Örnek Sayfa' : 'Role-Based Example Page'}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900 md:text-5xl">
            {isTr ? `${profession.roleName.tr} CV Örneği` : `${profession.roleName.en} Resume Example`}
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-slate-600">{profession.summary[locale]}</p>
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-700">
            <p className="font-medium">{PRICING_MESSAGE[locale]}</p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/cv/new"
              className="inline-flex h-11 items-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-black"
            >
              {isTr ? 'Bu Rol İçin CV Oluştur' : 'Build This Resume Free'}
            </Link>
            <Link
              href={getProfessionListPath(locale)}
              className="inline-flex h-11 items-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              {isTr ? 'Tüm Meslekler' : 'All Roles'}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-2xl border bg-white p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">{isTr ? 'Öne Çıkarılacak Yetkinlikler' : 'Core Skills to Highlight'}</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {profession.coreSkills[locale].map((skill) => (
              <span key={skill} className="rounded-full border bg-slate-50 px-3 py-1 text-sm text-slate-700">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-2xl border bg-white p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            {isTr ? 'Deneyim Bölümü İçin Başarı Cümlesi Fikirleri' : 'Achievement Bullet Ideas'}
          </h2>
          <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-700">
            {profession.achievementIdeas[locale].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

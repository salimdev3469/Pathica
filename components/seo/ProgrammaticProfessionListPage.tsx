import Link from 'next/link';
import type { Locale } from '@/lib/locale';
import type { ProfessionSeed } from '@/lib/seo/professions';
import { getProfessionPath } from '@/lib/seo/professions';
import { PRICING_MESSAGE } from '@/lib/seo/config';

type ProgrammaticProfessionListPageProps = {
  locale: Locale;
  title: string;
  description: string;
  professions: ProfessionSeed[];
};

export default function ProgrammaticProfessionListPage({
  locale,
  title,
  description,
  professions,
}: ProgrammaticProfessionListPageProps) {
  const isTr = locale === 'tr';
  const collectionSteps = isTr
    ? [
        'Uygun meslek kartını açıp örnek yapıyı gör.',
        'Yetkinlik ve başarı cümlelerini kendi deneyimine uyarlayıp not al.',
        'CV oluşturma ekranına geçip örneği kendi taslağına çevir.',
      ]
    : [
        'Open the role card that matches your target job.',
        'Adapt skills and achievement ideas to your own experience.',
        'Move to the builder and turn the example into your draft.',
      ];

  return (
    <main lang={locale} className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
            {isTr ? 'Programmatic SEO Koleksiyonu' : 'Programmatic SEO Collection'}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900 md:text-5xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg text-slate-600">{description}</p>
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-700">
            <p className="font-medium">{PRICING_MESSAGE[locale]}</p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/cv/new"
              className="inline-flex h-11 items-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-black"
            >
              {isTr ? 'Ücretsiz Oluştur' : 'Build Free'}
            </Link>
            <Link
              href="#role-grid"
              className="inline-flex h-11 items-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              {isTr ? 'Meslek Örneklerini İncele' : 'Browse Role Examples'}
            </Link>
          </div>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">
              {isTr ? 'Ne yapmalıyım?' : 'What should I do next?'}
            </p>
            <ol className="mt-3 space-y-2 text-sm text-slate-700">
              {collectionSteps.map((step, index) => (
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

      <section id="role-grid" className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {professions.map((profession) => (
            <article key={profession.slug} className="rounded-2xl border bg-white p-6 transition hover:shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">{profession.roleName[locale]}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{profession.summary[locale]}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {profession.coreSkills[locale].slice(0, 4).map((skill) => (
                  <span key={skill} className="rounded-full border bg-slate-50 px-3 py-1 text-xs text-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href={getProfessionPath(locale, profession.slug)}
                  className="inline-flex h-10 items-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-900"
                >
                  {isTr ? 'Örneği Gör' : 'View Example'}
                </Link>
                <Link
                  href="/cv/new"
                  className="inline-flex h-10 items-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-black"
                >
                  {isTr ? 'Bu Rol İçin Oluştur' : 'Build for This Role'}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-2xl border bg-slate-900 p-6 text-white md:p-8">
          <h2 className="text-2xl font-semibold">
            {isTr ? 'Örnekten çıkmadan uygulamaya geç' : 'Move from examples to action'}
          </h2>
          <p className="mt-3 text-sm text-slate-100">
            {isTr
              ? 'Örneklerden fikir alıp hemen CV taslağına geçtiğinde içerik kalitesi ve hız birlikte artar.'
              : 'When you go from role examples directly into drafting, quality and speed improve together.'}
          </p>
          <Link
            href="/cv/new"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            {isTr ? 'CV Oluşturmaya Başla' : 'Start Building Resume'}
          </Link>
        </div>
      </section>
    </main>
  );
}

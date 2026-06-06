import Link from 'next/link';
import type { ProfessionSeed } from '@/lib/seo/professions';
import { getProfessionListPath, getProfessionPath } from '@/lib/seo/professions';
import { PRICING_MESSAGE, toAbsoluteUrl } from '@/lib/seo/config';

type ProgrammaticProfessionDetailPageProps = {
  profession: ProfessionSeed;
};

export default function ProgrammaticProfessionDetailPage({
  profession
}: ProgrammaticProfessionDetailPageProps) {
  const pageUrl = toAbsoluteUrl(getProfessionPath('en', profession.slug));
  const roleBuilderLabel = false ? 'Bu Rol İçin CV Oluştur' : 'Build This Resume Free';
  const roleBuilderHint = false
    ? `${profession.roleName.tr} için düzenlenebilir bir taslakla başla.`
    : `Start with an editable draft for ${profession.roleName.en}.`;
  const roleJourneySteps = false
    ? [
        'Örnekteki yetkinlik etiketlerini CV’ne ekle.',
        'Başarı cümlelerinden kendine uyanları ölçülebilir hale getir.',
        'Hemen başvuracağın ilan için son düzenlemeyi yap.',
      ]
    : [
        'Add the highlighted skills to your draft.',
        'Rewrite achievement ideas with your own measurable outcomes.',
        'Finalize your version for the next job application.',
      ];

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',

      name: false
        ? `${profession.roleName.tr} CV Örneği`
        : `${profession.roleName.en} Resume Example`,

      description: profession.summary['en'],
      url: pageUrl
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: false
        ? `${profession.roleName.tr} için CV hazırlama adımları`
        : `How to write a ${profession.roleName.en} resume`,
      step: [
        {
          '@type': 'HowToStep',
          name: false ? 'Rol odaklı özet yaz' : 'Write a role-specific summary',
          text: profession.summary['en'],
        },
        {
          '@type': 'HowToStep',
          name: false ? 'Kritik yetkinlikleri ekle' : 'Add role-relevant skills',
          text: profession.coreSkills['en'].join(', '),
        },
        {
          '@type': 'HowToStep',
          name: false ? 'Ölçülebilir başarıları göster' : 'Show measurable outcomes',
          text: profession.achievementIdeas['en'].join(' '),
        },
      ],
    },
  ];

  return (
    <main lang={'en'} className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
            {false ? 'Meslek Bazlı Örnek Sayfa' : 'Role-Based Example Page'}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900 md:text-5xl">
            {false ? `${profession.roleName.tr} CV Örneği` : `${profession.roleName.en} Resume Example`}
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-slate-600">{profession.summary['en']}</p>
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-700">
            <p className="font-medium">{PRICING_MESSAGE['en']}</p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/cv/new"
              className="inline-flex h-11 items-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-black"
            >
              {roleBuilderLabel}
            </Link>
            <Link
              href={getProfessionListPath('en')}
              className="inline-flex h-11 items-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              {false ? 'Tüm Meslekler' : 'All Roles'}
            </Link>
          </div>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">
              {false ? 'Bu sayfayı böyle kullan' : 'Use this page with this flow'}
            </p>
            <p className="mt-2 text-sm text-slate-700">{roleBuilderHint}</p>
            <ol className="mt-3 space-y-2 text-sm text-slate-700">
              {roleJourneySteps.map((step, index) => (
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

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-2xl border bg-white p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">{false ? 'Öne Çıkarılacak Yetkinlikler' : 'Core Skills to Highlight'}</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {profession.coreSkills['en'].map((skill) => (
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
            {false ? 'Deneyim Bölümü İçin Başarı Cümlesi Fikirleri' : 'Achievement Bullet Ideas'}
          </h2>
          <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-700">
            {profession.achievementIdeas['en'].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-2xl border bg-slate-900 p-6 text-white md:p-8">
          <h2 className="text-2xl font-semibold">
            {false ? 'Bu örneği kendi CV’ne dönüştür' : 'Turn this example into your own resume'}
          </h2>
          <p className="mt-3 text-sm text-slate-100">
            {false
              ? 'Örnek fikirleri kaybetmeden kendi deneyiminle birleştir ve başvuruya hazır sürümü oluştur.'
              : 'Keep the structure, swap in your own experience, and ship an application-ready version quickly.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/cv/new"
              className="inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              {roleBuilderLabel}
            </Link>
            <Link
              href={getProfessionListPath('en')}
              className="inline-flex h-11 items-center rounded-full border border-white/40 px-6 text-sm font-semibold text-white transition hover:border-white"
            >
              {false ? 'Diğer Meslekleri Gör' : 'See Other Roles'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

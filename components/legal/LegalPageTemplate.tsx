import type { LegalPageContent } from '@/lib/legal-pages';
import Image from 'next/image';
import Link from 'next/link';

type LegalPageTemplateProps = {
  page: LegalPageContent;
};

export default function LegalPageTemplate({ page }: LegalPageTemplateProps) {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <header className="mb-8 border-b border-slate-200 pb-6">
            <div className="mb-8">
              <Link href="/" className="inline-block" aria-label="Go to Pathica homepage">
                <Image
                  src="/logo_pathica.png"
                  alt="Pathica Logo"
                  width={140}
                  height={140}
                  className="h-16 w-auto object-contain"
                />
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{page.title}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">{page.description}</p>
            {page.intro.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-sm leading-6 text-slate-700">
                {paragraph}
              </p>
            ))}
          </header>

          <div className="space-y-6">
            {page.sections.map((section) => (
              <section key={section.title} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
                <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>

                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-sm leading-6 text-slate-700">
                    {paragraph}
                  </p>
                ))}

                {section.bullets?.length ? (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

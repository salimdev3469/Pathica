import type { Metadata } from 'next';
import { CVTemplate } from '@/components/pdf/CVTemplate';
import { buildCvStateFromTemplate, cvTemplateSeeds } from '@/lib/cv-templates';

export const metadata: Metadata = {
  title: 'Template Preview Generator',
  robots: {
    index: false,
    follow: false,
  },
};

type TemplatePreviewPageProps = {
  searchParams?: {};
};

export default function TemplatePreviewPage({ searchParams }: TemplatePreviewPageProps) {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-16">
        {cvTemplateSeeds.map((template) => {
          const previewState = buildCvStateFromTemplate(template, locale);

          return (
            <section key={template.slug} className="space-y-4">
              <h1 className="text-base font-semibold text-slate-700">{template.slug}</h1>
              <div className="inline-block rounded-2xl bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.14)]">
                <div data-template-frame={template.slug} className="overflow-hidden rounded-sm border border-slate-200 bg-white">
                  <CVTemplate cv={previewState} />
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

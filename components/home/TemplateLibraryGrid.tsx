import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TemplateLocale } from '@/lib/cv-templates';
import { getCvTemplateSeed, getLocalizedText } from '@/lib/cv-templates';

type TemplateLibraryGridProps = {};

export function TemplateLibraryGrid({}: TemplateLibraryGridProps) {
  const template = getCvTemplateSeed('classic-ats');

  if (!template) {
    return null;
  }

  const highlights = [
    'Experience-first structure',
    'ATS-safe section labels',
    'Clean PDF-ready spacing',
  ];

  return (
    <div className="grid gap-8 rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_28px_80px_-48px_rgba(15,23,42,0.25)] lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:p-8">
      <div className="flex flex-col justify-between gap-8">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-slate-300 bg-slate-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
            {'Default ATS template'}
          </span>
          <h3 className="text-4xl font-semibold tracking-[-0.05em] text-slate-950 md:text-5xl">{'Classic ATS'}</h3>
          <p className="max-w-[42ch] text-lg leading-8 text-slate-600">
            {'This is the same structure Pathica opens by default in the editor. Clean hierarchy, ATS-safe headings, and balanced spacing from the first draft.'}
          </p>
          <div className="grid gap-3">
            {highlights.map((highlight) => (
              <div key={highlight} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {['ATS-safe', 'PDF', 'DOCX'].map((badge) => (
              <span
                key={`classic-ats-${badge}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600"
              >
                {badge}
              </span>
            ))}
          </div>
          <Button asChild className="h-12 rounded-full px-6 text-base">
            <Link href={`/cv/new?template=${template.slug}`}>
              {'Use This Template'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="relative">
        <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[30px] bg-gradient-to-br from-blue-100 via-sky-50 to-slate-100" />
        <div className="relative rounded-[30px] border border-slate-200 bg-[#f8fafc] p-4 shadow-[0_22px_60px_-36px_rgba(15,23,42,0.22)]">
          <div className="absolute left-4 top-4 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
            {'ATS-safe layout'}
          </div>
          <div className="absolute right-4 top-4 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
            {'Ready in editor'}
          </div>
          <div className="mx-auto mt-10 max-w-[460px] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_28px_70px_-36px_rgba(15,23,42,0.2)]">
            <Image
              src="/template-previews/classic-ats-legacy.png?v=20260516a"
              alt={getLocalizedText(template.previewAlt, locale)}
              width={1592}
              height={2250}
              unoptimized
              className="h-full w-full object-cover object-top"
              sizes="(min-width: 1280px) 36vw, (min-width: 1024px) 42vw, 92vw"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

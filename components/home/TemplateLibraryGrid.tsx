import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { TemplateLocale } from '@/lib/cv-templates';
import { getCvTemplateSeed, getLocalizedText } from '@/lib/cv-templates';

type TemplateLibraryGridProps = {
  locale: TemplateLocale;
};

export function TemplateLibraryGrid({ locale }: TemplateLibraryGridProps) {
  const isTr = locale === 'tr';
  const t = (en: string, tr: string) => (isTr ? tr : en);
  const template = getCvTemplateSeed('classic-ats');

  if (!template) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200/75 bg-transparent p-5 shadow-sm dark:border-slate-700/75 md:p-8">
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-10">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-slate-300 bg-slate-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-200">
            {t('Default ATS Template', 'Varsayılan ATS Şablonu')}
          </span>
          <h3 className="text-3xl font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-100 md:text-5xl md:leading-[1.05]">
            {t('Classic ATS', 'Klasik ATS')}
          </h3>
          <p className="max-w-[42ch] text-base leading-relaxed text-slate-700 dark:text-slate-200 md:text-[1.35rem] md:leading-9 md:tracking-[-0.01em]">
            {t(
              'This is the same template used in the CV editor by default. Clean hierarchy, ATS-safe section labels, and balanced spacing.',
              'Bu, CV editöründe varsayılan gelen aynı şablondur. Temiz hiyerarşi, ATS uyumlu bölüm başlıkları ve dengeli boşluk yapısı sunar.',
            )}
          </p>
          <ul className="space-y-2 text-base font-medium text-slate-700 dark:text-slate-200 md:text-xl md:leading-8">
            <li>• {t('Experience-first structure', 'Deneyim odaklı yapı')}</li>
            <li>• {t('Monochrome and ATS-friendly', 'Tek renkli ve ATS uyumlu')}</li>
            <li>• {t('Instantly opens in editor', 'Editörde anında açılır')}</li>
          </ul>
          <div className="flex items-center gap-2">
            {['PDF', 'DOCX'].map((badge) => (
              <span
                key={`classic-ats-${badge}`}
                className="rounded-[4px] bg-[#8f96ad] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white"
              >
                {badge}
              </span>
            ))}
          </div>
          <Button asChild className="h-11 w-full rounded-xl text-base sm:w-auto">
            <Link href={`/cv/new?template=${template.slug}`}>{t('Use This Template', 'Bu Şablonu Kullan')}</Link>
          </Button>
        </div>

        <div className="mx-auto w-full max-w-[470px] lg:max-w-[460px]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-slate-200/80 bg-transparent shadow-[0_14px_28px_rgba(15,23,42,0.1)] dark:border-slate-700/80">
            <Image
              src="/template-previews/classic-ats-legacy.png?v=20260516a"
              alt={getLocalizedText(template.previewAlt, locale)}
              width={1592}
              height={2250}
              unoptimized
              className="h-full w-full object-cover object-top"
              sizes="(min-width: 1280px) 34vw, (min-width: 1024px) 40vw, (min-width: 768px) 52vw, 95vw"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

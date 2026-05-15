import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CvTemplateSlug, TemplateLocale } from '@/lib/cv-templates';
import { cvTemplateSeeds, getLocalizedText } from '@/lib/cv-templates';

type TemplateLibraryGridProps = {
  locale: TemplateLocale;
};

const HOME_TEMPLATE_SLUGS: CvTemplateSlug[] = ['classic-ats', 'entry-starter', 'technical-impact'];

type HomeTemplateCard = {
  id: string;
  templateSlug: CvTemplateSlug;
  name: {
    en: string;
    tr: string;
  };
  target: {
    en: string;
    tr: string;
  };
  headline: {
    en: string;
    tr: string;
  };
  previewImage: string;
  previewAlt: {
    en: string;
    tr: string;
  };
  badges: string[];
  infoLabel: 'monochrome' | 'fixed';
};

const HOME_TEMPLATE_BADGES: Record<CvTemplateSlug, string[]> = {
  'classic-ats': ['PDF', 'DOCX'],
  'entry-starter': ['PDF'],
  'technical-impact': ['PDF', 'DOCX'],
  'career-switch': ['PDF'],
};

const HOME_TEMPLATE_EXTRA_CARDS: HomeTemplateCard[] = [
  {
    id: 'classic-ats-legacy',
    templateSlug: 'classic-ats',
    name: {
      en: 'Classic ATS (Original)',
      tr: 'Klasik ATS (Orijinal)',
    },
    target: {
      en: 'Previous default layout',
      tr: 'Önceki varsayılan düzen',
    },
    headline: {
      en: 'The previous classic ATS preview preserved as an extra option.',
      tr: 'Önceki klasik ATS önizlemesi ek seçenek olarak korundu.',
    },
    previewImage: '/template-previews/classic-ats-legacy.png?v=20260515d',
    previewAlt: {
      en: 'Original classic ATS resume preview',
      tr: 'Orijinal klasik ATS ozgecmis onizlemesi',
    },
    badges: ['PDF', 'DOCX'],
    infoLabel: 'fixed',
  },
];

export function TemplateLibraryGrid({ locale }: TemplateLibraryGridProps) {
  const isTr = locale === 'tr';
  const t = (en: string, tr: string) => (isTr ? tr : en);

  const seedTemplates = HOME_TEMPLATE_SLUGS
    .map((slug) => cvTemplateSeeds.find((template) => template.slug === slug))
    .filter((template): template is NonNullable<typeof template> => Boolean(template));

  const homeTemplates: HomeTemplateCard[] = [
    ...HOME_TEMPLATE_EXTRA_CARDS,
    ...seedTemplates.map((template) => ({
      id: template.slug,
      templateSlug: template.slug,
      name: template.name,
      target: template.target,
      headline: template.headline,
      previewImage: template.previewImage,
      previewAlt: template.previewAlt,
      badges: HOME_TEMPLATE_BADGES[template.slug],
      infoLabel: template.slug === 'classic-ats' ? 'monochrome' : 'fixed',
    })),
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {homeTemplates.map((template) => (
        <Card key={template.id} className="border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/85">
          <CardHeader>
            <div className="mb-4 space-y-3">
              <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
                <Image
                  src={template.previewImage}
                  alt={getLocalizedText(template.previewAlt, locale)}
                  width={1592}
                  height={2250}
                  className="h-auto w-full object-cover object-top"
                  sizes="(min-width: 1280px) 23vw, (min-width: 768px) 45vw, 92vw"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-500 text-[10px] leading-none">i</span>
                  <span>{template.infoLabel === 'monochrome' ? t('Monochrome', 'Tek renkli') : t('Fixed Preview', 'Sabit önizleme')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {template.badges.map((badge) => (
                    <span
                      key={`${template.id}-${badge}`}
                      className="rounded-[4px] bg-[#8f96ad] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <CardTitle>{getLocalizedText(template.name, locale)}</CardTitle>
            <CardDescription>{getLocalizedText(template.target, locale)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">{getLocalizedText(template.headline, locale)}</p>
            <Button asChild className="w-full">
              <Link href={`/cv/new?template=${template.templateSlug}`}>{t('Use This Template', 'Bu Şablonu Kullan')}</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

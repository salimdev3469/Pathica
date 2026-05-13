import { CVProvider } from '@/context/CVContext';
import { CVBuilder } from '@/components/cv-builder/CVBuilder';
import { CVPreview } from '@/components/cv-builder/CVPreview';
import { cookies } from 'next/headers';
import { CVState } from '@/context/CVContext';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';
import { normalizeCvFont } from '@/lib/cv-fonts';
import { getCvTemplateSeed, getLocalizedText, getCvTemplateDefaultFont } from '@/lib/cv-templates';

type GuestCVPageProps = {
    searchParams?: {
        template?: string;
    };
};

export default function GuestCVPage({ searchParams }: GuestCVPageProps) {
    const locale = normalizeLocale(cookies().get(LOCALE_COOKIE_NAME)?.value);
    const template = getCvTemplateSeed(searchParams?.template);

    const initialState: CVState = {
        id: 'guest-cv',
        title: template ? `${getLocalizedText(template.name, locale)} CV` : locale === 'tr' ? 'Başlıksız CV' : 'Untitled CV',
        templateSlug: template?.slug ?? null,
        personalInfo: {
            fullName: '',
            jobTitle: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            portfolio: '',
            github: '',
        },
        summaryTitle: locale === 'tr' ? 'Profil Özeti' : 'Profile Summary',
        summary: '',
        fontFamily: normalizeCvFont(template ? getCvTemplateDefaultFont(template.slug) : undefined),
        sections: [],
    };

    if (template) {
        initialState.personalInfo = {
            ...initialState.personalInfo,
            fullName: template.personalInfo.fullName,
            jobTitle: getLocalizedText(template.personalInfo.jobTitle, locale),
            email: template.personalInfo.email,
            phone: template.personalInfo.phone,
            location: getLocalizedText(template.personalInfo.location, locale),
            linkedin: template.personalInfo.linkedin,
            portfolio: template.personalInfo.portfolio,
            github: template.personalInfo.github,
        };
        initialState.summaryTitle = getLocalizedText(template.summaryTitle, locale);
        initialState.summary = getLocalizedText(template.summary, locale);
        initialState.sections = template.sections.map((section, sectionIndex) => ({
            id: crypto.randomUUID(),
            title: getLocalizedText(section.title, locale),
            position: sectionIndex,
            items: section.items.map((item, itemIndex) => ({
                id: crypto.randomUUID(),
                title: getLocalizedText(item.title, locale),
                subtitle: getLocalizedText(item.subtitle, locale),
                date: item.date,
                location: getLocalizedText(item.location, locale),
                bullets: getLocalizedText(item.bullets, locale),
                position: itemIndex,
            })),
        }));
    }

    return (
        <CVProvider initialState={initialState}>
            <div className="flex flex-col bg-slate-50 md:h-screen md:flex-row md:overflow-hidden">
                {/* Left side: Builder */}
                <div className="relative flex w-full flex-col border-b md:h-full md:w-1/2 md:border-b-0 md:border-r bg-slate-50">
                    <div className="absolute left-0 top-0 z-50 h-1 w-full bg-gradient-to-r from-primary to-blue-500 md:rounded-none"></div>
                    <CVBuilder locale={locale} />
                </div>

                {/* Right side: Preview */}
                <div id="preview-section" className="relative z-0 min-h-screen w-full bg-slate-200 shadow-inner md:h-full md:w-1/2">
                    <CVPreview />
                </div>
            </div>
        </CVProvider>
    );
}

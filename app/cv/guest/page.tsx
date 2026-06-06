import { CVProvider } from '@/context/CVContext';
import { CVWorkspace } from '@/components/cv-builder/CVWorkspace';
import { cookies } from 'next/headers';
import { CVState } from '@/context/CVContext';
import { normalizeCvFont } from '@/lib/cv-fonts';
import { getCvTemplateSeed, getLocalizedText, getCvTemplateDefaultFont } from '@/lib/cv-templates';

type GuestCVPageProps = {
    searchParams?: {
        template?: string;
    };
};

export default function GuestCVPage({ searchParams }: GuestCVPageProps) {
    const template = getCvTemplateSeed(searchParams?.template);
    const locale = 'en';

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
            <CVWorkspace />
        </CVProvider>
    );
}

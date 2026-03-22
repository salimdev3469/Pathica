import { CVProvider } from '@/context/CVContext';
import { CVBuilder } from '@/components/cv-builder/CVBuilder';
import { CVPreview } from '@/components/cv-builder/CVPreview';
import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CVState, Section, Item, PersonalInfo } from '@/context/CVContext';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';
import { normalizeCvFont } from '@/lib/cv-fonts';

type CvFieldRow = {
    id: string;
    label: string;
    value: string;
    field_type: string;
    position: number;
};

type CvSectionRow = {
    id: string;
    title: string;
    position: number;
    cv_fields: CvFieldRow[];
};

export default async function CVBuilderPage({ params }: { params: { id: string } }) {
    const locale = normalizeLocale(cookies().get(LOCALE_COOKIE_NAME)?.value);
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: cvData, error } = await supabase
        .from('cvs')
        .select(
            `
            id, title, user_id,
            cv_sections(
                id, title, position,
                cv_fields(
                    id, label, value, field_type, position
                )
            )
        `,
        )
        .eq('id', params.id)
        .single();

    if (error || !cvData) {
        console.error('Failed to load CV', error);
        redirect('/dashboard');
    }

    if (cvData.user_id !== user.id) {
        redirect('/dashboard'); // Not owner
    }

    // Transform to front-end state
    const allSections = ((cvData.cv_sections || []) as CvSectionRow[]).sort(
        (a, b) => a.position - b.position,
    );

    // Extract virtual sections
    const personalInfoSection = allSections.find((s) => s.title === '_personal_info');
    const summarySection = allSections.find((s) => s.title === '_summary');

    // Parse personal info
    let personalInfo: PersonalInfo | undefined;
    if (personalInfoSection && personalInfoSection.cv_fields[0]) {
        try {
            personalInfo = JSON.parse(personalInfoSection.cv_fields[0].value) as PersonalInfo;
        } catch {
            personalInfo = undefined;
        }
    }

    // Parse summary
    let summary = '';
    let summaryTitle = locale === 'tr' ? 'Profil Özeti' : 'Profile Summary';
    let summaryTitleFontSize: number | undefined;
    let summaryFontSize: number | undefined;
    let fontFamily = normalizeCvFont(undefined);
    if (summarySection) {
        const summaryField = summarySection.cv_fields.find((field) => field.label === 'summary') || summarySection.cv_fields[0];
        if (summaryField) {
            summary = summaryField.value;
        }

        const summaryTitleField = summarySection.cv_fields.find((field) => field.label === 'summary_title');
        if (summaryTitleField?.value) {
            summaryTitle = summaryTitleField.value;
        }

        const fontFamilyField = summarySection.cv_fields.find((field) => field.label === 'font_family');
        if (fontFamilyField?.value) {
            fontFamily = normalizeCvFont(fontFamilyField.value);
        }

        const summaryTitleFontSizeField = summarySection.cv_fields.find((field) => field.label === 'summary_title_font_size');
        if (summaryTitleFontSizeField?.value) {
            const parsed = parseInt(summaryTitleFontSizeField.value, 10);
            if (!isNaN(parsed)) summaryTitleFontSize = parsed;
        }

        const summaryFontSizeField = summarySection.cv_fields.find((field) => field.label === 'summary_font_size');
        if (summaryFontSizeField?.value) {
            const parsed = parseInt(summaryFontSizeField.value, 10);
            if (!isNaN(parsed)) summaryFontSize = parsed;
        }
    }
    // Filter normal sections
    const normalSections = allSections.filter(
        (s) => s.title !== '_personal_info' && s.title !== '_summary' && s.title !== '_ats_meta',
    );

    const sections: Section[] = normalSections.map((sectionRow) => {
        let titleFontSize: number | undefined;
        const metaField = (sectionRow.cv_fields || []).find((f) => f.label === 'section_meta');
        if (metaField) {
            try { titleFontSize = JSON.parse(metaField.value).titleFontSize; } catch { }
        }

        return {
            id: sectionRow.id,
            title: sectionRow.title,
            position: sectionRow.position,
            ...(titleFontSize !== undefined && { titleFontSize }),
            items: (sectionRow.cv_fields || [])
                .sort((a, b) => a.position - b.position)
                .map((fieldRow) => {
                    if (fieldRow.field_type === 'item') {
                        try {
                            return JSON.parse(fieldRow.value) as Item;
                        } catch {
                            return null;
                        }
                    }
                    return null;
                })
                .filter(Boolean) as Item[],
        };
    });

    const initialState: CVState = {
        id: cvData.id,
        title: cvData.title,
        personalInfo: personalInfo || ({} as PersonalInfo),
        summaryTitle,
        ...(summaryTitleFontSize !== undefined && { summaryTitleFontSize }),
        fontFamily,
        summary: summary || '',
        ...(summaryFontSize !== undefined && { summaryFontSize }),
        sections,
    };

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
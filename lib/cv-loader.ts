import { createClient } from '@/lib/supabase-server';
import { CVState, Section, Item, PersonalInfo } from '@/context/CVContext';
import { normalizeCvFont } from '@/lib/cv-fonts';
import { isCvTemplateSlug } from '@/lib/cv-templates';

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

export async function loadCvState(cvId: string): Promise<CVState | null> {
    const supabase = createClient();
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
        .eq('id', cvId)
        .single();

    if (error || !cvData) {
        return null;
    }

    // Transform to front-end state
    const allSections = ((cvData.cv_sections || []) as CvSectionRow[]).sort(
        (a, b) => a.position - b.position,
    );

    const personalInfoSection = allSections.find((s) => s.title === '_personal_info');
    const summarySection = allSections.find((s) => s.title === '_summary');

    let personalInfo: PersonalInfo | undefined;
    if (personalInfoSection && personalInfoSection.cv_fields[0]) {
        try {
            personalInfo = JSON.parse(personalInfoSection.cv_fields[0].value) as PersonalInfo;
        } catch {
            personalInfo = undefined;
        }
    }

    let summary = '';
    let summaryTitle = 'Profile Summary';
    let summaryTitleFontSize: number | undefined;
    let summaryFontSize: number | undefined;
    let letterSpacing: number | undefined;
    let templateSlug: CVState['templateSlug'] = null;
    let fontFamily = normalizeCvFont(undefined);

    if (summarySection) {
        const summaryField = summarySection.cv_fields.find((field) => field.label === 'summary') || summarySection.cv_fields[0];
        if (summaryField) summary = summaryField.value;

        const summaryTitleField = summarySection.cv_fields.find((field) => field.label === 'summary_title');
        if (summaryTitleField?.value) summaryTitle = summaryTitleField.value;

        const fontFamilyField = summarySection.cv_fields.find((field) => field.label === 'font_family');
        if (fontFamilyField?.value) fontFamily = normalizeCvFont(fontFamilyField.value);

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

        const letterSpacingField = summarySection.cv_fields.find((field) => field.label === 'letter_spacing');
        if (letterSpacingField?.value) {
            const parsed = parseFloat(letterSpacingField.value);
            if (!isNaN(parsed)) letterSpacing = parsed;
        }

        const templateSlugField = summarySection.cv_fields.find((field) => field.label === 'template_slug');
        if (templateSlugField?.value && isCvTemplateSlug(templateSlugField.value)) {
            templateSlug = templateSlugField.value;
        }
    }

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

    return {
        id: cvData.id,
        title: cvData.title,
        templateSlug,
        personalInfo: personalInfo || ({} as PersonalInfo),
        summaryTitle,
        ...(summaryTitleFontSize !== undefined && { summaryTitleFontSize }),
        fontFamily,
        summary: summary || '',
        ...(summaryFontSize !== undefined && { summaryFontSize }),
        ...(letterSpacing !== undefined && { letterSpacing }),
        sections,
    };
}

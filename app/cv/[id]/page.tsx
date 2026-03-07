import { CVProvider } from '@/context/CVContext';
import { CVBuilder } from '@/components/cv-builder/CVBuilder';
import { CVPreview } from '@/components/cv-builder/CVPreview';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { CVState, Section, Item, PersonalInfo } from '@/context/CVContext';

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
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: cvData, error } = await supabase
        .from('cvs')
        .select(`
            id, title, user_id,
            cv_sections(
                id, title, position,
                cv_fields(
                    id, label, value, field_type, position
                )
            )
        `)
        .eq('id', params.id)
        .single();

    if (error || !cvData) {
        console.error('Failed to load CV', error);
        redirect('/dashboard');
    }

    if (cvData.user_id !== user.id) {
        redirect('/dashboard'); // Not owner
    }

    // Transform to front-end State
    const allSections = (cvData.cv_sections as CvSectionRow[]).sort((a, b) => a.position - b.position);

    // Extract virtual sections
    const personalInfoSection = allSections.find((s) => s.title === '_personal_info');
    const summarySection = allSections.find((s) => s.title === '_summary');

    // Parse personal info
    let personalInfo: PersonalInfo | undefined;
    const personalInfoField = personalInfoSection?.cv_fields?.find((f) => f.label === 'personal_info');
    if (personalInfoField?.value) {
        try {
            personalInfo = JSON.parse(personalInfoField.value);
        } catch { }
    }

    const personalSectionTitleField = personalInfoSection?.cv_fields?.find((f) => f.label === 'personal_section_title');
    const personalSectionTitle = personalSectionTitleField?.value || 'Personal Information & Summary';

    // Parse summary
    let summary = '';
    const summaryField = summarySection?.cv_fields?.find((f) => f.label === 'summary') || summarySection?.cv_fields?.[0];
    if (summaryField?.value) {
        summary = summaryField.value;
    }

    // Filter normal sections
    const normalSections = allSections.filter((s) => s.title !== '_personal_info' && s.title !== '_summary');

    const sections: Section[] = normalSections.map((s) => ({
        id: s.id,
        title: s.title,
        position: s.position,
        items: s.cv_fields
            .sort((a, b) => a.position - b.position)
            .map((f) => {
                if (f.field_type === 'item') {
                    try {
                        return JSON.parse(f.value) as Item;
                    } catch {
                        return null;
                    }
                }
                return null;
            })
            .filter(Boolean) as Item[],
    }));

    const initialState: CVState = {
        id: cvData.id,
        title: cvData.title,
        personalSectionTitle,
        ...(personalInfo && { personalInfo }),
        ...(summary && { summary }),
        sections,
    };

    return (
        <CVProvider initialState={initialState}>
            <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
                {/* Left side: Builder */}
                <div className="w-full md:w-1/2 h-full border-r bg-slate-50 relative flex flex-col">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500 z-50 rounded-t"></div>
                    <CVBuilder />
                </div>

                {/* Right side: Preview */}
                <div className="w-full md:w-1/2 h-full bg-slate-200 shadow-inner relative z-0">
                    <CVPreview />
                </div>
            </div>
        </CVProvider>
    );
}

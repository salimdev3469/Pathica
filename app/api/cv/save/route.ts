import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cvState = await req.json();

        if (!cvState || !cvState.id) {
            return NextResponse.json({ error: 'Invalid CV state' }, { status: 400 });
        }

        // Verify ownership
        const { data: cvCheck } = await supabase
            .from('cvs')
            .select('id')
            .eq('id', cvState.id)
            .eq('user_id', user.id)
            .single();

        if (!cvCheck) {
            return NextResponse.json({ error: 'CV not found or unauthorized' }, { status: 404 });
        }

        // Update CV title
        await supabase
            .from('cvs')
            .update({ title: cvState.title, updated_at: new Date().toISOString() })
            .eq('id', cvState.id);

        // Simplest way to "update" sections/fields perfectly is to delete old and insert new.
        await supabase.from('cv_sections').delete().eq('cv_id', cvState.id);

        // 1. Insert _personal_info section
        const { data: piSection } = await supabase
            .from('cv_sections')
            .insert({ cv_id: cvState.id, title: '_personal_info', position: -2 })
            .select().single();

        if (piSection && cvState.personalInfo) {
            await supabase.from('cv_fields').insert({
                section_id: piSection.id,
                label: 'personal_info',
                value: JSON.stringify(cvState.personalInfo),
                field_type: 'json',
                position: 0
            });
        }

        // 2. Insert _summary section
        const { data: summarySection } = await supabase
            .from('cv_sections')
            .insert({ cv_id: cvState.id, title: '_summary', position: -1 })
            .select().single();

        if (summarySection && typeof cvState.summary === 'string') {
            await supabase.from('cv_fields').insert({
                section_id: summarySection.id,
                label: 'summary',
                value: cvState.summary,
                field_type: 'text',
                position: 0
            });
        }

        // 3. Insert normal user sections
        for (let i = 0; i < cvState.sections.length; i++) {
            const section = cvState.sections[i];
            const { data: sectionData, error: sectionError } = await supabase
                .from('cv_sections')
                .insert({
                    cv_id: cvState.id,
                    title: section.title,
                    position: section.position,
                })
                .select()
                .single();

            if (sectionError) throw sectionError;

            if (section.items && section.items.length > 0) {
                const fieldsToInsert = section.items.map((item: any) => ({
                    section_id: sectionData.id,
                    label: item.title || 'item',
                    value: JSON.stringify(item),
                    field_type: 'item',
                    position: item.position,
                }));

                const { error: fieldsError } = await supabase.from('cv_fields').insert(fieldsToInsert);
                if (fieldsError) throw fieldsError;
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving CV:', error);
        return NextResponse.json({ error: 'Failed to save CV' }, { status: 500 });
    }
}

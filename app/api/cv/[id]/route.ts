import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { isMissingTableInSchemaCache } from '@/lib/supabase-errors';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { error: applicationsError } = await supabase
            .from('job_applications')
            .update({ cv_id: null })
            .eq('cv_id', params.id)
            .eq('user_id', user.id);

        if (applicationsError) {
            return NextResponse.json({ error: applicationsError.message }, { status: 500 });
        }

        const { error: coverLettersError } = await supabase
            .from('cover_letters')
            .update({ cv_id: null })
            .eq('cv_id', params.id)
            .eq('user_id', user.id);

        if (coverLettersError && !isMissingTableInSchemaCache(coverLettersError, 'cover_letters')) {
            return NextResponse.json({ error: coverLettersError.message }, { status: 500 });
        }

        const { error } = await supabase
            .from('cvs')
            .delete()
            .eq('id', params.id)
            .eq('user_id', user.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

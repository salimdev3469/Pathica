import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { loadCvState } from '@/lib/cv-loader';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const state = await loadCvState(params.id);
    if (!state) {
        return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    // Security check: ensure CV belongs to the user
    // (loadCvState currently uses createClient which uses the user's session if available, 
    // but it's better to verify explicitly if we want to be safe)
    
    // Check ownership
    const { data: cv } = await supabase
        .from('cvs')
        .select('user_id')
        .eq('id', params.id)
        .single();
        
    if (!cv || cv.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(state);
}

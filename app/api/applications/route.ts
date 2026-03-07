import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { job_id, job_title, company } = await req.json();

        const { data, error } = await supabase
            .from('job_applications')
            .insert({
                user_id: user.id,
                job_id,
                job_title,
                company,
                status: 'applied'
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error logging application:', error);
        return NextResponse.json({ error: 'Failed to log application' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id, status } = await req.json();

        const { data, error } = await supabase
            .from('job_applications')
            .update({ status })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error updating application:', error);
        return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
    }
}

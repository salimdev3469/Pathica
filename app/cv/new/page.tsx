import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function NewCVPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Create new CV
    const { data: cv, error } = await supabase
        .from('cvs')
        .insert([{ id: crypto.randomUUID(), user_id: user.id, title: 'Untitled CV' }])
        .select('id')
        .single();

    if (error || !cv) {
        console.error('Failed to create CV:', error);
        redirect('/dashboard?error=failed_to_create');
    }

    redirect(`/cv/${cv.id}`);
}

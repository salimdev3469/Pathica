import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import CoverLetterEdit from './CoverLetterEdit';
import { cookies } from 'next/headers';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';

export default async function EditCoverLetterPage({ params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: coverLetter } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();

    if (!coverLetter) {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
                <CoverLetterEdit 
                    coverLetter={coverLetter} 
                    userName={user.user_metadata?.full_name || user.email?.split('@')[0] || 'Applicant'}
                    userEmail={user.email || ''}
                />
            </div>
        </div>
    );
}

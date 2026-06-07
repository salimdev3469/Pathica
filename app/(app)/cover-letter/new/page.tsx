import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import CoverLetterBuilder from './CoverLetterBuilder';
import { cookies } from 'next/headers';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';

export default async function NewCoverLetterPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: cvs } = await supabase
        .from('cvs')
        .select('id,title')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

    return (
        <div className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <CoverLetterBuilder cvs={cvs || []} userName={user.user_metadata?.full_name || user.email?.split('@')[0] || ''} />
            </div>
        </div>
    );
}

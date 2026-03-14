import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';

export default async function NewCVPage() {
  const locale = normalizeLocale(cookies().get(LOCALE_COOKIE_NAME)?.value);
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: cv, error } = await supabase
    .from('cvs')
    .insert([{ id: crypto.randomUUID(), user_id: user.id, title: locale === 'tr' ? 'Başlıksız CV' : 'Untitled CV' }])
    .select('id')
    .single();

  if (error || !cv) {
    console.error('Failed to create CV:', error);
    redirect('/dashboard?error=failed_to_create');
  }

  redirect(`/cv/${cv.id}`);
}

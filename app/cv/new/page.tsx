import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';
import { getCvTemplateSeed } from '@/lib/cv-templates';

type NewCVPageProps = {
  searchParams?: {
    template?: string;
    restoreGuest?: string;
  };
};

export default async function NewCVPage({ searchParams }: NewCVPageProps) {
  const locale = normalizeLocale(cookies().get(LOCALE_COOKIE_NAME)?.value);
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const template = getCvTemplateSeed(searchParams?.template)?.slug;
  const shouldRestoreGuest = searchParams?.restoreGuest === '1';
  const forwardParams = new URLSearchParams();

  if (template) {
    forwardParams.set('template', template);
  }

  if (shouldRestoreGuest) {
    forwardParams.set('restoreGuest', '1');
  }

  const forwardQuery = forwardParams.toString();
  const forwardSuffix = forwardQuery ? `?${forwardQuery}` : '';

  if (!user) {
    redirect(`/cv/guest${forwardSuffix}`);
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

  redirect(`/cv/${cv.id}${forwardSuffix}`);
}

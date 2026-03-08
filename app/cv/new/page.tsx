import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CVProvider } from '@/context/CVContext';
import { CVBuilder } from '@/components/cv-builder/CVBuilder';
import { CVPreview } from '@/components/cv-builder/CVPreview';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';

export default async function NewCVPage() {
  const locale = normalizeLocale(cookies().get(LOCALE_COOKIE_NAME)?.value);
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
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

  return (
    <CVProvider>
      <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
        <div className="w-full md:w-1/2 h-full border-r bg-slate-50 relative flex flex-col">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500 z-50 rounded-t"></div>
          <CVBuilder locale={locale} />
        </div>

        <div className="w-full md:w-1/2 h-full bg-slate-200 shadow-inner relative z-0">
          <CVPreview />
        </div>
      </div>
    </CVProvider>
  );
}

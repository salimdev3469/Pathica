import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { tr as trLocale } from 'date-fns/locale';
import { Calendar, FileText, Plus } from 'lucide-react';
import DashboardBillingBar from '@/components/dashboard/DashboardBillingBar';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getWalletSnapshot } from '@/lib/billing';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';
import { createClient } from '@/lib/supabase-server';

type CoverLetterRow = {
  id: string;
  job_title: string | null;
  company_name: string | null;
  updated_at: string;
};

function isBillingSchemaCacheError(error: unknown): boolean {
  const asRecord = error as { code?: string; message?: string } | null;
  if (!asRecord) return false;

  const code = String(asRecord.code || '');
  const message = String(asRecord.message || '');
  return code === 'PGRST205' || message.includes('shopier_payments') || message.includes('credit_wallets');
}

export default async function CoverLettersDashboardPage() {
  const locale = normalizeLocale(cookies().get(LOCALE_COOKIE_NAME)?.value);
  const t = (en: string, tr: string) => (locale === 'tr' ? tr : en);
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  const { data: coverLetters } = await supabase
    .from('cover_letters')
    .select('id,job_title,company_name,updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  const coverLetterList = (coverLetters || []) as CoverLetterRow[];
  let wallet = { creditBalance: 0, freeExportsRemaining: 0 };
  let billingSchemaMissing = false;

  try {
    wallet = await getWalletSnapshot(user.id);
  } catch (error) {
    if (isBillingSchemaCacheError(error)) {
      billingSchemaMissing = true;
    } else {
      throw error;
    }
  }

  return (
    <DashboardShell active="coverLetters" userEmail={user.email} locale={locale}>
      <section className="mb-7 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('My Cover Letters', 'Ön Yazılarım')}</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {t(
                'Create and manage personalized cover letters for your job applications.',
                'İş başvurularınız için kişiselleştirilmiş ön yazılar oluşturun ve yönetin.',
              )}
            </p>
          </div>
          <Button
            asChild
            className="h-11 gap-2 rounded-xl bg-slate-900 px-5 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black hover:shadow-md dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            <Link href="/cover-letter/new">
              <Plus className="h-4 w-4" /> {t('New Cover Letter', 'Yeni Ön Yazı')}
            </Link>
          </Button>
        </div>
      </section>

      <DashboardBillingBar locale={locale} wallet={wallet} billingSchemaMissing={billingSchemaMissing} />

      {coverLetterList.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {coverLetterList.map((coverLetter) => (
            <Card
              key={coverLetter.id}
              className="group rounded-2xl border-slate-200 bg-white/95 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <CardHeader>
                <CardTitle className="text-xl text-slate-900 dark:text-slate-100">
                  <span className="truncate pr-2">{coverLetter.job_title || t('Untitled', 'İsimsiz')}</span>
                </CardTitle>
                <CardDescription className="flex flex-col gap-1 text-slate-500 dark:text-slate-400">
                  {coverLetter.company_name ? <span>{coverLetter.company_name}</span> : null}
                  <div className="flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(coverLetter.updated_at), locale === 'tr' ? { locale: trLocale } : undefined)} {t('ago', 'önce')}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full text-sm font-medium">
                  <Link href={`/cover-letter/${coverLetter.id}`}>{t('Edit / View', 'Düzenle / Görüntüle')}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/95 py-16 dark:border-slate-700 dark:bg-slate-900/80">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{t('No Cover Letters', 'Ön Yazı Yok')}</h3>
          <p className="mb-6 max-w-sm text-center text-sm text-slate-500 dark:text-slate-400">
            {t('Create your first personalized cover letter for your dream job.', 'Hayalinizdeki iş için ilk kişiselleştirilmiş ön yazınızı oluşturun.')}
          </p>
          <Button asChild className="h-11 rounded-xl bg-slate-900 px-5 text-white hover:bg-black dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
            <Link href="/cover-letter/new">
              <Plus className="mr-2 h-4 w-4" />
              {t('Create Cover Letter', 'Ön Yazı Oluştur')}
            </Link>
          </Button>
        </div>
      )}
    </DashboardShell>
  );
}

import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { tr as trLocale } from 'date-fns/locale';
import { Calendar, FileText, Plus } from 'lucide-react';
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
  return code === 'PGRST205' || message.includes('billing_payments') || message.includes('credit_wallets');
}

export default async function CoverLettersDashboardPage() {
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
    <DashboardShell
      active="coverLetters"
      userEmail={user.email}
      userName={user.user_metadata?.full_name}
      wallet={wallet}
      billingSchemaMissing={billingSchemaMissing}>
      <section className="mb-7 rounded-xl border border-white/10 bg-white/[0.02] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{'My Cover Letters'}</h1>
            <p className="mt-2 text-sm text-white/60">
              {'Create and manage personalized cover letters for your job applications.'}
            </p>
          </div>
          <Button
            asChild
            className="h-11 gap-2 rounded-xl bg-orange-600 px-5 text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-700"
          >
            <Link href="/cover-letter/new">
              <Plus className="h-4 w-4" /> {'New Cover Letter'}
            </Link>
          </Button>
        </div>
      </section>
      {coverLetterList.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {coverLetterList.map((coverLetter) => (
            <Card
              key={coverLetter.id}
              className="group rounded-xl border-white/10 bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  <span className="truncate pr-2">{coverLetter.job_title || 'Untitled'}</span>
                </CardTitle>
                <CardDescription className="flex flex-col gap-1 text-white/60">
                  {coverLetter.company_name ? <span>{coverLetter.company_name}</span> : null}
                  <div className="flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(coverLetter.updated_at))} {'ago'}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="h-10 w-full rounded-xl border-orange-500/30 bg-zinc-950 text-orange-500 transition hover:bg-orange-500/10 hover:border-orange-500/50 text-sm font-medium">
                  <Link href={`/cover-letter/${coverLetter.id}`}>{'Edit / View'}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-16">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-white/50">
            <FileText className="h-6 w-6" />
          </div>
          <p className="text-sm text-white/50">
            {'No cover letters generated yet.'}
          </p>
        </div>
      )}
    </DashboardShell>
  );
}

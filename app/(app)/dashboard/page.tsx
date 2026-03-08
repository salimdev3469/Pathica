import fs from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { tr as trLocale } from 'date-fns/locale';
import { Plus, FileText, Calendar, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import LogoutButton from '@/components/LogoutButton';
import GenerateCvFromJobButton from '@/components/dashboard/GenerateCvFromJobButton';
import CvShareActions from '@/components/dashboard/CvShareActions';
import { createClient } from '@/lib/supabase-server';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';

type DashboardCv = {
    id: string;
    title: string;
    updated_at: string;
};

type AtsFieldRow = {
    label: string;
    value: string;
};

type AtsSectionRow = {
    cv_id: string;
    cv_fields?: AtsFieldRow[];
};

type AtsMeta = {
    score: number | null;
    reason: string | null;
};

export default async function DashboardPage() {
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

    const { data: cvs } = await supabase
        .from('cvs')
        .select('id,title,updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

    const cvList = (cvs || []) as DashboardCv[];
    const cvIds = cvList.map((cv) => cv.id);

    const atsByCvId = new Map<string, AtsMeta>();
    if (cvIds.length > 0) {
        const { data: atsSections } = await supabase
            .from('cv_sections')
            .select('cv_id,cv_fields(label,value)')
            .in('cv_id', cvIds)
            .eq('title', '_ats_meta');

        for (const section of (atsSections || []) as AtsSectionRow[]) {
            const fields = Array.isArray(section.cv_fields) ? section.cv_fields : [];
            const scoreRaw = fields.find((field) => field.label === 'score')?.value;
            const reasonRaw = fields.find((field) => field.label === 'reason')?.value || '';
            const parsedScore = Number(scoreRaw);

            atsByCvId.set(section.cv_id, {
                score: Number.isFinite(parsedScore) ? Math.max(0, Math.min(100, Math.round(parsedScore))) : null,
                reason: reasonRaw || null,
            });
        }
    }

    const logoSrc = getLogoSrc();
    const darkLogoSrc = getDarkLogoSrc();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
            <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
                <div className="mx-auto flex h-24 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src={logoSrc} alt={t('Pathica logo', 'Pathica logosu')} width={144} height={144} className="h-28 w-28 object-contain dark:hidden" />
                        <Image src={darkLogoSrc} alt={t('Pathica dark logo', 'Pathica koyu logosu')} width={144} height={144} className="hidden h-28 w-28 object-contain dark:block" />
                    </Link>

                    <div className="hidden rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 sm:flex">
                        {user.email || t('Signed in', 'Giriş yapıldı')}
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6">
                <section className="mb-7 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('My Resumes', 'Özgeçmişlerim')}</h1>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                {t(
                                    'Manage your CVs, improve ATS score, and jump back into editing quickly.',
                                    'CV’lerini yönet, ATS skorunu geliştir ve düzenlemeye hızlıca geri dön.',
                                )}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <GenerateCvFromJobButton locale={locale} />
                            <Button
                                asChild
                                className="h-11 gap-2 rounded-xl bg-slate-900 px-5 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black hover:shadow-md dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                            >
                                <Link href="/cv/new">
                                    <Plus className="h-4 w-4" /> {t('New CV', 'Yeni CV')}
                                </Link>
                            </Button>
                            <LogoutButton locale={locale} className="h-11 rounded-xl border border-slate-200 px-4 dark:border-slate-700" />
                        </div>
                    </div>
                </section>

                {cvList.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {cvList.map((cv) => {
                            const ats = atsByCvId.get(cv.id) || { score: null, reason: null };
                            const reasonPreview = ats.reason
                                ? ats.reason.length > 150
                                    ? `${ats.reason.slice(0, 147)}...`
                                    : ats.reason
                                : null;

                            return (
                                <Card
                                    key={cv.id}
                                    className="group rounded-2xl border-slate-200 bg-white/95 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <CardHeader>
                                        <CvShareActions cvId={cv.id} cvTitle={cv.title} atsScore={ats.score} />
                                        <CardTitle className="flex items-start justify-between text-xl text-slate-900 dark:text-slate-100">
                                            <span className="truncate pr-2">{cv.title}</span>
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                            <Calendar className="h-3 w-3" />
                                            {t('Updated', 'Güncellendi')}{' '}
                                            {formatDistanceToNow(new Date(cv.updated_at), locale === 'tr' ? { locale: trLocale } : undefined)}{' '}
                                            {t('ago', 'önce')}
                                        </CardDescription>
                                        <div className="pt-1">
                                            {ats.score !== null ? (
                                                <span
                                                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getAtsScoreStyles(
                                                        ats.score,
                                                    )}`}
                                                >
                                                    ATS {t('Score', 'Skoru')}: {ats.score}/100
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                    ATS {t('Score', 'Skoru')}: {t('Pending', 'Bekleniyor')}
                                                </span>
                                            )}
                                            {reasonPreview && (
                                                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{t('Why', 'Neden')}: {reasonPreview}</p>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Button
                                            variant="outline"
                                            className="h-11 w-full rounded-xl border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                                            asChild
                                        >
                                            <Link href={`/cv/${cv.id}`}>
                                                <Edit2 className="mr-2 h-4 w-4" /> {t('Open Editor', 'Editörü Aç')}
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/95 py-20 dark:border-slate-700 dark:bg-slate-900/80">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <FileText className="h-10 w-10" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{t('No CVs yet', 'Henüz CV yok')}</h3>
                        <p className="mb-6 max-w-sm text-center text-slate-500 dark:text-slate-400">
                            {t(
                                'Create your first CV and start optimizing it for ATS and recruiter readability.',
                                'İlk CV’ni oluştur ve ATS ile insan kaynakları okunabilirliği için optimize etmeye başla.',
                            )}
                        </p>
                        <Button
                            size="lg"
                            className="h-12 rounded-xl bg-slate-900 text-white hover:bg-black dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                            asChild
                        >
                            <Link href="/cv/new">
                                <Plus className="mr-2 h-5 w-5" /> {t('Create Your First CV', 'İlk CV’ni Oluştur')}
                            </Link>
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}

function getAtsScoreStyles(score: number) {
    if (score >= 80) {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-300';
    }

    if (score >= 60) {
        return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300';
    }

    return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-300';
}

function getLogoSrc() {
    try {
        const mtime = fs.statSync(path.join(process.cwd(), 'public', 'logo_pathica.png')).mtimeMs;
        return `/logo_pathica.png?v=${Math.floor(mtime)}`;
    } catch {
        return '/logo_pathica.png';
    }
}

function getDarkLogoSrc() {
    try {
        const mtime = fs.statSync(path.join(process.cwd(), 'public', 'logo_pathica_footer.png')).mtimeMs;
        return `/logo_pathica_footer.png?v=${Math.floor(mtime)}`;
    } catch {
        return '/logo_pathica_footer.png';
    }
}
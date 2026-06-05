import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { tr as trLocale } from 'date-fns/locale';
import { Calendar, FileText, Plus } from 'lucide-react';
import AtsReason from '@/components/dashboard/AtsReason';
import CvCardActions from '@/components/dashboard/CvCardActions';
import CvShareActions from '@/components/dashboard/CvShareActions';
import DashboardBillingBar from '@/components/dashboard/DashboardBillingBar';
import DashboardShell from '@/components/dashboard/DashboardShell';
import GenerateCvFromJobButton from '@/components/dashboard/GenerateCvFromJobButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateKnowledgeBasedAts } from '@/lib/ats-knowledge-score';
import { getWalletSnapshot } from '@/lib/billing';
import { LOCALE_COOKIE_NAME, normalizeLocale, type Locale } from '@/lib/locale';
import { createClient } from '@/lib/supabase-server';

type DashboardCv = {
  id: string;
  title: string;
  updated_at: string;
  ats_score: number | null;
};

type AtsFieldRow = {
  label: string;
  value: string;
};

type AtsSectionRow = {
  cv_id: string;
  cv_fields?: AtsFieldRow[];
};

type CvFieldRow = {
  label: string;
  value: string;
  field_type: string | null;
  position: number;
};

type CvSectionRow = {
  cv_id: string;
  title: string;
  position: number;
  cv_fields?: CvFieldRow[];
};

type ScoreItem = {
  title?: string;
  subtitle?: string;
  date?: string;
  location?: string;
  bullets?: string;
  position?: number;
};

type AtsMeta = {
  score: number | null;
  reason: string | null;
};

function isBillingSchemaCacheError(error: unknown): boolean {
  const asRecord = error as { code?: string; message?: string } | null;
  if (!asRecord) return false;

  const code = String(asRecord.code || '');
  const message = String(asRecord.message || '');
  return code === 'PGRST205' || message.includes('billing_payments') || message.includes('credit_wallets');
}

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
    .select('id,title,updated_at,ats_score')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  const cvList = (cvs || []) as DashboardCv[];
  const cvIds = cvList.map((cv) => cv.id);

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

  const atsByCvId = await buildAtsByCvId(supabase, cvList, cvIds);

  return (
    <DashboardShell active="resumes" userEmail={user.email} locale={locale}>
      <section className="mb-7 rounded-2xl border border-white/10 bg-white/[0.02] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{t('My Resumes', 'Özgeçmişlerim')}</h1>
            <p className="mt-2 text-sm text-white/60">
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
              className="h-11 gap-2 rounded-xl bg-white px-5 text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-md"
            >
              <Link href="/cv/new">
                <Plus className="h-4 w-4" /> {t('New CV', 'Yeni CV')}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <DashboardBillingBar locale={locale} wallet={wallet} billingSchemaMissing={billingSchemaMissing} />

      {cvList.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cvList.map((cv) => {
            const ats = atsByCvId.get(cv.id) || { score: null, reason: null };
            const localizedReason = ats.reason ? localizeAtsReason(ats.reason, locale) : null;

            return (
              <Card
                key={cv.id}
                className="group rounded-2xl border-white/10 bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-white/20"
              >
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <CardTitle className="min-w-0 flex-1 text-xl leading-tight text-white">
                      <span className="block break-words pr-1 [overflow-wrap:anywhere]">{cv.title}</span>
                    </CardTitle>
                    <CvShareActions cvId={cv.id} cvTitle={cv.title} atsScore={ats.score} />
                  </div>
                  <CardDescription className="flex items-center gap-1 text-white/50">
                    <Calendar className="h-3 w-3" />
                    {t('Updated', 'Güncellendi')}{' '}
                    {formatDistanceToNow(new Date(cv.updated_at), locale === 'tr' ? { locale: trLocale } : undefined)}{' '}
                    {t('ago', 'önce')}
                  </CardDescription>
                  <div className="pt-1">
                    {ats.score !== null ? (
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getAtsScoreStyles(ats.score)}`}>
                        ATS {t('Score', 'Skoru')}: {ats.score}/100
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/70">
                        ATS {t('Score', 'Skoru')}: {t('Pending', 'Bekleniyor')}
                      </span>
                    )}
                    {localizedReason ? <AtsReason reason={localizedReason} locale={locale} /> : null}
                  </div>
                </CardHeader>
                <CardContent>
                  <CvCardActions cvId={cv.id} cvTitle={cv.title} locale={locale} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.02] py-20">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileText className="h-10 w-10" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-white">{t('No CVs yet', 'Henüz CV yok')}</h3>
          <p className="mb-6 max-w-sm text-center text-white/60">
            {t(
              'Create your first CV and start optimizing it for ATS and recruiter readability.',
              'İlk CV’ni oluştur ve ATS ile insan kaynakları okunabilirliği için optimize etmeye başla.',
            )}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <GenerateCvFromJobButton
              locale={locale}
              triggerClassName="h-12 rounded-xl border-slate-300 px-5 text-sm font-semibold"
            />
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
        </div>
      )}
    </DashboardShell>
  );
}

async function buildAtsByCvId(
  supabase: ReturnType<typeof createClient>,
  cvList: DashboardCv[],
  cvIds: string[],
): Promise<Map<string, AtsMeta>> {
  const atsByCvId = new Map<string, AtsMeta>();
  if (cvIds.length === 0) {
    return atsByCvId;
  }

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

  for (const cv of cvList) {
    const fromMeta = atsByCvId.get(cv.id);
    if (fromMeta?.score !== null) {
      continue;
    }

    if (typeof cv.ats_score === 'number' && Number.isFinite(cv.ats_score)) {
      atsByCvId.set(cv.id, {
        score: Math.max(0, Math.min(100, Math.round(cv.ats_score))),
        reason: fromMeta?.reason || null,
      });
    }
  }

  const cvIdsMissingScore = cvList
    .filter((cv) => {
      const ats = atsByCvId.get(cv.id);
      return !ats || ats.score === null;
    })
    .map((cv) => cv.id);

  if (cvIdsMissingScore.length === 0) {
    return atsByCvId;
  }

  const { data: fallbackSections } = await supabase
    .from('cv_sections')
    .select('cv_id,title,position,cv_fields(label,value,field_type,position)')
    .in('cv_id', cvIdsMissingScore)
    .neq('title', '_ats_meta');

  const computedByCvId = buildComputedAtsByCvId((fallbackSections || []) as CvSectionRow[]);

  for (const cvId of cvIdsMissingScore) {
    const computed = computedByCvId.get(cvId) || buildDefaultAtsMeta();
    atsByCvId.set(cvId, computed);
  }

  return atsByCvId;
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

function localizeAtsReason(reason: string, locale: Locale): string {
  if (!reason) {
    return reason;
  }

  const normalizedReason = normalizeAtsReasonText(reason);

  if (locale !== 'tr') {
    return normalizedReason;
  }

  const translatedSectionsPrefix = 'Eksik temel bölümler:';
  const missingSectionsMatch = normalizedReason.match(/^Missing core sections:\s*([^.]*)\.?/i);
  let localized = normalizedReason.trim();

  if (missingSectionsMatch) {
    const rawLabels = missingSectionsMatch[1]?.trim() || '';
    const translatedLabels = rawLabels ? translateAtsSectionLabels(rawLabels) : '';
    const translatedMissingCore = translatedLabels
      ? `${translatedSectionsPrefix} ${translatedLabels}.`
      : 'Eksik temel bölümler.';

    localized = localized.replace(
      /^Missing core sections:\s*[^.]*\.?\s*/i,
      `${translatedMissingCore} `,
    );
  }

  const replacements: Array<[RegExp, string]> = [
    [/Expand summary with role-specific keywords\.?/i, 'Özeti role özel anahtar kelimelerle genişlet.'],
    [/Add more concise bullet points for recent roles\.?/i, 'Son roller için daha öz ve net madde işaretleri ekle.'],
    [
      /Include measurable outcomes \([^)]*\) in achievements\.?/i,
      'Başarılara yüzdeler veya somut sayılarla ölçülebilir çıktılar ekle.',
    ],
    [/Start bullet points with stronger[^.]*\.?/i, 'Madde işaretlerine daha güçlü aksiyon fiilleriyle başla.'],
    [/Add clear dates for experience and education entries\.?/i, 'Deneyim ve eğitim girdilerine net tarih ekle.'],
    [
      /Strong ATS baseline: complete structure, quantified impact, and clear role language\.?/i,
      'ATS temeli güçlü: yapı tamam, etki ölçülebilir ve rol dili net.',
    ],
    [
      /ATS baseline is solid; improve role-specific keywords to increase competitiveness\.?/i,
      'ATS temeli sağlam; rekabetçiliği artırmak için role özel anahtar kelimeleri geliştir.',
    ],
  ];

  for (const [pattern, translation] of replacements) {
    localized = localized.replace(pattern, translation);
  }

  return localized.replace(/\s+/g, ' ').trim();
}

function normalizeAtsReasonText(reason: string): string {
  return reason.replace(/\(%\s*\/?\s*numbers?\)/gi, '(percentages or concrete numbers)');
}

function translateAtsSectionLabels(labels: string): string {
  const dictionary: Record<string, string> = {
    Experience: 'Deneyim',
    Education: 'Eğitim',
    Skills: 'Yetenekler',
    Projects: 'Projeler',
    Certifications: 'Sertifikalar',
    Languages: 'Diller',
  };

  return labels
    .split(',')
    .map((part) => part.trim())
    .map((part) => dictionary[part] || part)
    .join(', ');
}

function buildComputedAtsByCvId(rows: CvSectionRow[]): Map<string, AtsMeta> {
  const grouped = new Map<string, CvSectionRow[]>();
  for (const row of rows) {
    const list = grouped.get(row.cv_id);
    if (list) {
      list.push(row);
    } else {
      grouped.set(row.cv_id, [row]);
    }
  }

  const result = new Map<string, AtsMeta>();
  grouped.forEach((sections, cvId) => {
    const scored = calculateKnowledgeBasedAts(buildKnowledgeScoreInput(sections));
    result.set(cvId, {
      score: scored.score,
      reason: null,
    });
  });

  return result;
}

function buildKnowledgeScoreInput(rows: CvSectionRow[]) {
  const sortedRows = [...rows].sort((a, b) => a.position - b.position);

  const personalInfoSection = sortedRows.find((section) => section.title === '_personal_info');
  const summarySection = sortedRows.find((section) => section.title === '_summary');
  const contentSections = sortedRows.filter(
    (section) => section.title !== '_personal_info' && section.title !== '_summary' && section.title !== '_ats_meta',
  );

  const personalInfo = parsePersonalInfo(personalInfoSection?.cv_fields);
  const summary = extractSummary(summarySection?.cv_fields);
  const sections = contentSections.map((section, sectionIndex) => ({
    title: section.title,
    position: typeof section.position === 'number' ? section.position : sectionIndex,
    items: (Array.isArray(section.cv_fields) ? section.cv_fields : [])
      .filter((field) => field.field_type === 'item')
      .sort((a, b) => a.position - b.position)
      .map((field, fieldIndex) => parseScoreItem(field, fieldIndex)),
  }));

  return {
    personalInfo,
    summary,
    sections,
  };
}

function parsePersonalInfo(fields: CvFieldRow[] | undefined): Record<string, string> {
  if (!Array.isArray(fields)) {
    return {};
  }

  const personalInfoRaw = fields.find((field) => field.label === 'personal_info')?.value;
  if (!personalInfoRaw) {
    return {};
  }

  try {
    const parsed = JSON.parse(personalInfoRaw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.entries(parsed).reduce<Record<string, string>>((acc, [key, value]) => {
      if (typeof value === 'string') {
        const normalized = value.trim();
        if (normalized) {
          acc[key] = normalized;
        }
      }
      return acc;
    }, {});
  } catch {
    return {};
  }
}

function extractSummary(fields: CvFieldRow[] | undefined): string {
  if (!Array.isArray(fields)) {
    return '';
  }

  return fields.find((field) => field.label === 'summary')?.value || '';
}

function parseScoreItem(field: CvFieldRow, index: number): ScoreItem {
  if (!field.value) {
    return { position: index };
  }

  try {
    const parsed = JSON.parse(field.value) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {
        title: field.label || 'item',
        bullets: field.value,
        position: index,
      };
    }

    return {
      title: asNonEmptyString(parsed.title) || field.label || 'item',
      subtitle: asNonEmptyString(parsed.subtitle),
      date: asNonEmptyString(parsed.date),
      location: asNonEmptyString(parsed.location),
      bullets: asNonEmptyString(parsed.bullets) || '',
      position: typeof parsed.position === 'number' ? parsed.position : index,
    };
  } catch {
    return {
      title: field.label || 'item',
      bullets: field.value,
      position: index,
    };
  }
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

function buildDefaultAtsMeta(): AtsMeta {
  return {
    score: null,
    reason: null,
  };
}

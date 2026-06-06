import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AiReviewDashboard, { type AiReviewClientReview } from '@/components/dashboard/AiReviewDashboard';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { serializeReviewForClient, type ResumeReviewRecord } from '@/lib/ai-review/report';
import { getWalletSnapshot } from '@/lib/billing';
import { AI_REVIEW_FIX_CREDIT_COST, BILLING_PACKAGES } from '@/lib/billing-config';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';
import { createClient } from '@/lib/supabase-server';

type ResumeReviewRow = {
  id: string;
  file_name: string;
  file_type: string;
  category: string;
  field: string;
  experience_level: string;
  job_description: string | null;
  file_path: string | null;
  normalized_resume: ResumeReviewRecord['normalizedResume'];
  analysis: ResumeReviewRecord['analysis'];
  score: number;
  ontology_version: string;
  created_at: string;
};

function isBillingSchemaCacheError(error: unknown): boolean {
  const asRecord = error as { code?: string; message?: string } | null;
  if (!asRecord) return false;

  const code = String(asRecord.code || '');
  const message = String(asRecord.message || '');
  return code === 'PGRST205' || message.includes('billing_payments') || message.includes('credit_wallets');
}

function isResumeReviewSchemaError(error: unknown): boolean {
  const asRecord = error as { code?: string; message?: string } | null;
  if (!asRecord) return false;

  const code = String(asRecord.code || '');
  const message = String(asRecord.message || '');
  return code === 'PGRST205' || message.includes('resume_reviews');
}

export default async function AiReviewDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

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

  let initialReviews: AiReviewClientReview[] = [];
  let reviewSchemaMissing = false;
  const { data: reviewRows, error: reviewError } = await supabase
    .from('resume_reviews')
    .select(
      'id,file_name,file_type,category,field,experience_level,job_description,file_path,normalized_resume,analysis,score,ontology_version,created_at',
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30);

  if (reviewError) {
    if (isResumeReviewSchemaError(reviewError)) {
      reviewSchemaMissing = true;
    } else {
      throw reviewError;
    }
  }

  if (reviewRows) {
    initialReviews = (reviewRows as ResumeReviewRow[]).map((row) =>
      serializeReviewForClient({
        id: row.id,
        fileName: row.file_name,
        fileType: row.file_type,
        category: row.category,
        field: row.field,
        experienceLevel: row.experience_level,
        jobDescription: row.job_description || '',
        filePath: row.file_path,
        normalizedResume: row.normalized_resume,
        analysis: row.analysis,
        score: row.score,
        ontologyVersion: row.ontology_version,
        createdAt: row.created_at,
      }),
    );
  }

  const scores = initialReviews.map((review) => review.score).filter((score) => Number.isFinite(score));
  const initialStats = {
    targetScore: 92,
    bestScore: scores.length > 0 ? Math.max(...scores) : null,
    avgScore: scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null,
    reviewCount: initialReviews.length,
  };

  const billingPackages = BILLING_PACKAGES.map((pkg) => ({
    code: pkg.id,
    name: pkg.name,
    credits: pkg.credits,
    priceLabel: pkg.displayPrice,
    highlight: pkg.isPopular,
  }));

  return (
    <DashboardShell
      active="aiReview"
      userEmail={user.email}
      userName={user.user_metadata?.full_name}
      wallet={wallet}
      billingSchemaMissing={billingSchemaMissing || reviewSchemaMissing}>
      <AiReviewDashboard
        initialReviews={initialReviews}
        initialStats={initialStats}
        billingPackages={billingPackages}
        fixCreditCost={AI_REVIEW_FIX_CREDIT_COST}
        billingSchemaMissing={billingSchemaMissing || reviewSchemaMissing} />
    </DashboardShell>
  );
}

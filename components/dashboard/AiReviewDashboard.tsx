'use client';;
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Brain,
  Briefcase,
  Check,
  Code2,
  FileText,
  Loader2,
  LockKeyhole,
  Megaphone,
  Palette,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  Wrench,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import CheckoutButton from '@/components/billing/CheckoutButton';
import { CVTemplate } from '@/components/pdf/CVTemplate';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TextShimmer } from '@/components/ui/text-shimmer';
import type { CVState } from '@/context/CVContext';
import { AI_REVIEW_ONTOLOGY, type ExperienceLevelId, type ReviewCategoryId, type ReviewFieldId } from '@/lib/ai-review/ontology';
import type { NormalizedResume } from '@/lib/ai-review/extract';
import type { ReviewAnalysis } from '@/lib/ai-review/score';
import { CV_PAGE_HEIGHT_PX, CV_PAGE_WIDTH_PX } from '@/lib/cv-layout';

type BillingPackageView = {
  code: string;
  name: string;
  credits: number;
  priceLabel: string;
  highlight?: boolean;
};

export type AiReviewClientReview = {
  id: string;
  fileName: string;
  fileType: string;
  category: string;
  field: string;
  experienceLevel: string;
  filePath?: string | null;
  normalizedResume: NormalizedResume;
  analysis: ReviewAnalysis;
  score: number;
  ontologyVersion: string;
  createdAt: string;
  headline: string;
};

type AiReviewStats = {
  targetScore: number;
  bestScore: number | null;
  avgScore: number | null;
  reviewCount: number;
};

type AiReviewDashboardProps = {
  initialReviews: AiReviewClientReview[];
  initialStats: AiReviewStats;
  billingPackages: BillingPackageView[];
  fixCreditCost: number;
  billingSchemaMissing?: boolean;
};

type HistoryResponse = {
  reviews?: AiReviewClientReview[];
  stats?: AiReviewStats;
  error?: string;
};

type AnalyzeResponse = {
  review?: AiReviewClientReview;
  error?: string;
};

type FixResponse = {
  cvId?: string;
  error?: string;
  code?: string;
};

const CATEGORY_ICONS: Record<string, typeof Code2> = {
  software_engineering: Code2,
  engineering_stem: Wrench,
  business_finance: Briefcase,
  design_creative: Palette,
  marketing_sales: Megaphone,
  operations_support: Target,
};

const BREAKDOWN_LABELS: Record<keyof ReviewAnalysis['breakdown'], string> = {
  atsStructure: 'ATS',
  contentEvidence: 'Content',
  writingQuality: 'Writing',
  jobMatch: 'Job Match',
  readiness: 'Ready',
};

export default function AiReviewDashboard({
  initialReviews,
  initialStats,
  billingPackages,
  fixCreditCost,
  billingSchemaMissing = false
}: AiReviewDashboardProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [reviews, setReviews] = useState(initialReviews);
  const [stats, setStats] = useState(initialStats);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<ReviewCategoryId>('software_engineering');
  const [field, setField] = useState<ReviewFieldId>('general_software');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevelId>('mid');
  const [jobDescription, setJobDescription] = useState('');
  const [activeReview, setActiveReview] = useState<AiReviewClientReview | null>(initialReviews[0] || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(8);
  const [billingOpen, setBillingOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fieldsForCategory = useMemo(() => {
    const selectedCategory = AI_REVIEW_ONTOLOGY.categories.find((item) => item.id === category);
    const fieldIds = selectedCategory?.fields || [];
    return AI_REVIEW_ONTOLOGY.fields.filter((candidate) => fieldIds.includes(candidate.id));
  }, [category]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch('/api/ai-review', { cache: 'no-store' });
        const payload = (await response.json().catch(() => ({}))) as HistoryResponse;
        if (!response.ok) return;
        setReviews(payload.reviews || []);
        setStats(payload.stats || initialStats);
        setActiveReview((current) => current || payload.reviews?.[0] || null);
      } catch {
        // History is non-critical; upload/review flow still works.
      }
    };

    void loadHistory();
  }, [initialStats]);

  useEffect(() => {
    if (fieldsForCategory.length > 0 && !fieldsForCategory.some((candidate) => candidate.id === field)) {
      setField(fieldsForCategory[0].id);
    }
  }, [field, fieldsForCategory]);

  useEffect(() => {
    setStats((current) => recomputeStats(reviews, current.targetScore));
  }, [reviews]);

  useEffect(() => {
    if (!isAnalyzing) {
      setLoadingProgress(8);
      return;
    }

    const interval = window.setInterval(() => {
      setLoadingProgress((current) => Math.min(94, current + Math.max(1, Math.round((96 - current) / 8))));
    }, 420);

    return () => window.clearInterval(interval);
  }, [isAnalyzing]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    setSelectedFile(file);
    setWizardOpen(true);
    setStep(0);
    event.target.value = '';
  };

  const handleCategorySelect = (nextCategory: ReviewCategoryId) => {
    setCategory(nextCategory);
    const nextField = AI_REVIEW_ONTOLOGY.fields.find((candidate) => candidate.categoryId === nextCategory)
      || AI_REVIEW_ONTOLOGY.fields.find((candidate) => AI_REVIEW_ONTOLOGY.categories.find((item) => item.id === nextCategory)?.fields.includes(candidate.id));
    if (nextField) {
      setField(nextField.id);
    }
  };

  const startReview = async () => {
    if (!selectedFile) {
      toast.error('Please upload a resume file first.');
      return;
    }

    setWizardOpen(false);
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.set('file', selectedFile);
      formData.set('category', category);
      formData.set('field', field);
      formData.set('experienceLevel', experienceLevel);
      formData.set('jobDescription', jobDescription);

      const response = await fetch('/api/ai-review/analyze', {
        method: 'POST',
        body: formData,
      });
      const payload = (await response.json().catch(() => ({}))) as AnalyzeResponse;

      if (!response.ok || !payload.review) {
        throw new Error(payload.error || 'Could not analyze this CV.');
      }

      const completedReview = payload.review;
      setLoadingProgress(100);
      setReviews((current) => {
        return [completedReview, ...current.filter((item) => item.id !== completedReview.id)];
      });
      setActiveReview(completedReview);
      setSelectedFile(null);
      toast.success('AI Review completed.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Review failed.');
      setWizardOpen(true);
    } finally {
      window.setTimeout(() => setIsAnalyzing(false), 350);
    }
  };

  const fixActiveReview = async () => {
    if (!activeReview) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/ai-review/${activeReview.id}/fix`, { method: 'POST' });
        const payload = (await response.json().catch(() => ({}))) as FixResponse;

        if (response.status === 402 || payload.code === 'INSUFFICIENT_CREDITS') {
          setBillingOpen(true);
          return;
        }

        if (!response.ok || !payload.cvId) {
          throw new Error(payload.error || 'Could not create fixed CV.');
        }

        router.push(`/cv/${payload.cvId}?fixed=true`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Fix failed.');
      }
    });
  };

  return (
    <div className="space-y-7">
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>

            <h1 className="text-4xl font-bold tracking-tight text-white">{'AI Resume Review'}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
              {'Free analysis uses file extraction, schema normalization, ontology mapping, and weighted mathematical scoring. LLM is only used for paid CV fixes.'}
            </p>
          </div>
          <div className="shrink-0">
            <Button
              onClick={openFilePicker}
              className="h-11 rounded-xl bg-orange-600 px-6 font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-xl"
            >
              <Plus className="mr-2 h-4 w-4" /> {'New Review'}
            </Button>
          </div>
        </div>
      </section>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Target} label={'Target Score'} value={`${stats.targetScore}+`} hint="Hire Zone" tone="emerald" />
        <MetricCard icon={TrendingUp} label={'Your Best'} value={stats.bestScore === null ? '--' : String(stats.bestScore)} hint="/100" tone="slate" />
        <MetricCard icon={Brain} label={'Reviews'} value={String(stats.reviewCount)} hint={'completed'} tone="blue" />
        <MetricCard icon={Sparkles} label={'Avg Score'} value={stats.avgScore === null ? '--' : String(stats.avgScore)} hint="/100" tone="amber" />
      </section>
      {activeReview ? (
        <section className="flex flex-col gap-5 xl:flex-row">
          <div className="w-full xl:w-[45%] shrink-0 rounded-2xl border border-white/10 bg-white/[0.02] p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-white/50">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold text-white">{activeReview.fileName}</h3>
                  <p className="text-xs text-white/50">{new Date(activeReview.createdAt).toLocaleDateString(false ? 'tr-TR' : 'en-US')}</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">Ready</span>
            </div>
            <ResumePreview review={activeReview} />
          </div>

          <ResultPanel
            review={activeReview}
            onFix={fixActiveReview}
            isFixing={isPending}
            fixCreditCost={fixCreditCost} />
        </section>
      ) : null}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-white">{'Review History'}</h2>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {reviews.map((review) => (
              <button
                key={review.id}
                type="button"
                onClick={() => setActiveReview(review)}
                className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                  activeReview?.id === review.id
                    ? 'border-orange-500/40 bg-orange-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">{review.fileName}</p>
                    <p className="mt-1 text-xs text-white/50">{review.headline}</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-white">{review.score}/100</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-white/20 p-8 text-center text-sm text-white/50">
            {'Upload your first resume to create a deterministic review.'}
          </p>
        )}
      </section>
      <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" className="hidden" onChange={handleFileChange} />
      <ReviewWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        step={step}
        setStep={setStep}
        category={category}
        field={field}
        experienceLevel={experienceLevel}
        jobDescription={jobDescription}
        selectedFile={selectedFile}
        fieldsForCategory={fieldsForCategory}
        onCategorySelect={handleCategorySelect}
        onFieldSelect={setField}
        onExperienceSelect={setExperienceLevel}
        onJobDescriptionChange={setJobDescription}
        onStart={startReview} />
      {isAnalyzing ? <AnalyzingOverlay progress={loadingProgress} /> : null}
      {isPending ? <FixingOverlay /> : null}
      <BillingModal
        open={billingOpen}
        onOpenChange={setBillingOpen}
        packages={billingPackages}
        fixCreditCost={fixCreditCost}
        billingSchemaMissing={billingSchemaMissing} />
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  hint: string;
  tone: 'emerald' | 'slate' | 'blue' | 'amber';
}) {
  const toneClasses = {
    emerald: 'bg-emerald-500/10 text-emerald-500',
    slate: 'bg-slate-900/10 text-slate-800 dark:bg-slate-100/10 dark:text-slate-200',
    blue: 'bg-orange-500/10 text-orange-500',
    amber: 'bg-amber-500/10 text-amber-500',
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-8 shadow-sm text-center">
      <p className="mb-2 text-sm font-semibold text-white/60">{label}</p>
      <div className="flex items-end justify-center gap-2">
        <span className="text-5xl font-black tracking-tight text-white">{value}</span>
        <span className="pb-1 text-sm font-semibold text-emerald-400">{hint}</span>
      </div>
    </div>
  );
}

function ReviewWizard(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: number;
  setStep: (step: number) => void;
  category: ReviewCategoryId;
  field: ReviewFieldId;
  experienceLevel: ExperienceLevelId;
  jobDescription: string;
  selectedFile: File | null;
  fieldsForCategory: typeof AI_REVIEW_ONTOLOGY.fields;
  onCategorySelect: (category: ReviewCategoryId) => void;
  onFieldSelect: (field: ReviewFieldId) => void;
  onExperienceSelect: (level: ExperienceLevelId) => void;
  onJobDescriptionChange: (value: string) => void;
  onStart: () => void;
}) {
  const canGoNext = props.step === 0 ? Boolean(props.category) : props.step === 1 ? Boolean(props.field) : true;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="flex h-[100dvh] w-full max-w-none flex-col overflow-hidden rounded-none border-0 bg-zinc-950 p-0 text-white sm:h-[92vh] sm:max-h-[92vh] sm:w-[94vw] sm:max-w-6xl sm:rounded-2xl sm:border sm:border-white/10 sm:shadow-2xl">
        <DialogHeader className="shrink-0 border-b border-white/10 p-4 sm:p-8">
          <DialogTitle className="text-2xl sm:text-3xl font-black">{'AI Resume Review'}</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">{wizardSubtitle(props.step, props.locale)}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-7">
          <StepIndicator step={props.step} />

          {props.selectedFile ? (
            <div className="mx-auto mb-6 sm:mb-8 max-w-2xl rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs sm:text-sm text-white/70">
              <FileText className="mr-2 inline h-4 w-4" />
              {props.selectedFile.name} · {(props.selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </div>
          ) : null}

          {props.step === 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              {AI_REVIEW_ONTOLOGY.categories.map((item) => {
                const Icon = CATEGORY_ICONS[item.id] || Target;
                const isSelected = props.category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => props.onCategorySelect(item.id)}
                    className={`rounded-2xl border p-4 sm:p-7 text-center transition hover:-translate-y-0.5 hover:shadow-lg ${
                      isSelected
                        ? 'border-white/30 bg-white/10 text-white shadow-xl'
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/5'
                    }`}
                  >
                    <div className="mx-auto mb-3 sm:mb-5 flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-white/5 text-white/50 shadow-sm">
                      <Icon className="h-7 w-7 sm:h-9 sm:w-9" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white">{item.label}</h3>
                    <p className={`mt-1 sm:mt-2 text-xs sm:text-sm ${isSelected ? 'text-white/80' : 'text-white/50'}`}>{item.description}</p>
                  </button>
                );
              })}
            </div>
          ) : null}

          {props.step === 1 ? (
            <div className="mx-auto max-w-5xl text-center">
              <h3 className="mb-2 text-2xl sm:text-3xl font-black">{AI_REVIEW_ONTOLOGY.categories.find((item) => item.id === props.category)?.label}</h3>
              <p className="mb-6 sm:mb-8 text-sm sm:text-base text-slate-500">{'Select your specific field'}</p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {props.fieldsForCategory.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => props.onFieldSelect(item.id)}
                    className={`rounded-full border px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold transition ${
                      props.field === item.id
                        ? 'border-white/30 bg-white/10 text-white shadow-lg'
                        : 'border-white/10 bg-transparent text-white/70 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {props.step === 2 ? (
            <div className="mx-auto max-w-5xl">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {AI_REVIEW_ONTOLOGY.experienceLevels.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => props.onExperienceSelect(level.id)}
                    className={`min-w-28 sm:min-w-32 rounded-2xl border px-4 sm:px-6 py-3 sm:py-4 text-center transition ${
                      props.experienceLevel === level.id
                        ? 'border-white/30 bg-white/10 text-white shadow-lg'
                        : 'border-white/10 bg-transparent text-white/70 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <span className="block text-base sm:text-lg font-black">{level.label}</span>
                    <span className="text-xs sm:text-sm opacity-70">{level.range}</span>
                  </button>
                ))}
              </div>

              <label className="mt-6 sm:mt-9 block">
                <span className="mb-2 sm:mb-3 flex items-center gap-2 text-base sm:text-lg font-bold">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-blue-300" />
                  {'Add job description (optional)'}
                </span>
                <textarea
                  value={props.jobDescription}
                  onChange={(event) => props.onJobDescriptionChange(event.target.value)}
                  rows={5}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 text-sm text-white outline-none transition focus:border-white/30 focus:ring-4 focus:ring-white/10 placeholder:text-white/30"
                  placeholder={'Paste the job description to score keyword coverage mathematically.'}
                />
              </label>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-white/10 bg-zinc-950 p-4 shadow-[0_-12px_30px_rgba(0,0,0,0.5)] sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => props.setStep(Math.max(0, props.step - 1))}
              disabled={props.step === 0}
              className="h-10 sm:h-12 rounded-xl px-4 sm:px-5 border-white/10 bg-transparent text-sm sm:text-base text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {'Back'}
            </Button>

            {props.step < 2 ? (
              <Button
                onClick={() => props.setStep(Math.min(2, props.step + 1))}
                disabled={!canGoNext}
                className="h-10 sm:h-12 rounded-xl bg-orange-600 px-6 sm:px-7 text-sm sm:text-base font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-700"
              >
                {'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={props.onStart}
                className="h-10 sm:h-12 rounded-xl bg-orange-600 px-6 sm:px-8 text-sm sm:text-base font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-700"
              >
                {'Start Review'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepIndicator({
  step
}: {
  step: number;
}) {
  const labels = false ? ['Kategori', 'Alan', 'Deneyim'] : ['Category', 'Field', 'Experience'];

  return (
    <div className="mx-auto mb-6 sm:mb-10 flex max-w-3xl items-center justify-center">
      {labels.map((label, index) => {
        const isComplete = index < step;
        const isActive = index === step;
        return (
          <div key={label} className="flex items-center">
            <div className="text-center">
              <div
                className={`mx-auto flex h-10 w-10 sm:h-16 sm:w-16 items-center justify-center rounded-full text-lg sm:text-2xl font-black ${
                  isComplete || isActive
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'bg-white/5 text-white/30'
                }`}
              >
                {isComplete ? <Check className="h-5 w-5 sm:h-7 sm:w-7" /> : index + 1}
              </div>
              <p className={`mt-2 sm:mt-3 text-xs sm:text-sm font-bold ${isComplete || isActive ? 'text-white' : 'text-white/30'}`}>{label}</p>
            </div>
            {index < labels.length - 1 ? (
              <div className={`mx-2 sm:mx-5 h-1 w-8 sm:w-24 lg:w-36 rounded-full ${index < step ? 'bg-white' : 'bg-white/10'}`} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function wizardSubtitle(step: number, locale: Locale): string {
  if (step === 0) return false ? 'Alan kategorini seç' : 'Select your field category';
  if (step === 1) return false ? 'Spesifik alanını seç' : 'Choose your specific field';
  return false ? 'Deneyim seviyeni ve opsiyonel iş tanımını ekle' : 'Set your experience level and optional job description';
}

function AnalyzingOverlay({
  progress
}: {
  progress: number;
}) {
  const lines = false
    ? ['CV analiz ediliyor...', 'Ontoloji eşlemesi kuruluyor...', 'Deterministik skor hesaplanıyor...']
    : ['Analyzing your CV...', 'Building ontology matches...', 'Calculating deterministic score...'];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setIndex((current) => (current + 1) % lines.length), 1250);
    return () => window.clearInterval(interval);
  }, [lines.length]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-white px-6 dark:bg-slate-950">
      <div className="absolute inset-x-0 bottom-0 h-2 bg-slate-200 dark:bg-slate-800">
        <div className="h-full bg-gradient-to-r from-slate-900 via-orange-600 to-emerald-500 transition-all duration-500 dark:from-slate-100 dark:via-orange-400 dark:to-emerald-400" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:text-blue-300">
          <Brain className="h-12 w-12 animate-pulse" />
          <div className="absolute inset-0 animate-ping rounded-2xl border border-orange-500/30" />
        </div>
        <TextShimmer
          key={lines[index]}
          as="p"
          duration={1.1}
          className="py-2 text-4xl font-semibold leading-[1.25] md:text-6xl [--base-color:#2563eb] [--base-gradient-color:#93c5fd]"
        >
          {lines[index]}
        </TextShimmer>
      </div>
    </div>
  );
}

function FixingOverlay({}: {}) {
  const lines = false
    ? ['CV yeniden yazılıyor...', 'Zayıf eylem fiilleri düzeltiliyor...', 'Anahtar kelimeler yerleştiriliyor...', 'ATS skoru maksimize ediliyor...']
    : ['Rewriting your CV...', 'Fixing weak action verbs...', 'Injecting target keywords...', 'Maximizing ATS score...'];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setIndex((current) => (current + 1) % lines.length), 2000);
    return () => window.clearInterval(interval);
  }, [lines.length]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-white px-6 dark:bg-slate-950">
      <div className="absolute inset-x-0 bottom-0 h-2 bg-slate-200 dark:bg-slate-800">
        <div className="h-full w-full animate-pulse bg-gradient-to-r from-emerald-500 via-orange-600 to-indigo-500 transition-all duration-500 dark:from-emerald-400 dark:via-orange-400 dark:to-indigo-400" />
      </div>
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
          <Sparkles className="h-12 w-12 animate-pulse" />
          <div className="absolute inset-0 animate-ping rounded-2xl border border-emerald-500/30" />
        </div>
        <TextShimmer
          key={lines[index]}
          as="p"
          duration={1.1}
          className="py-2 text-4xl font-semibold leading-[1.25] md:text-6xl [--base-color:#10b981] [--base-gradient-color:#6ee7b7]"
        >
          {lines[index]}
        </TextShimmer>
      </div>
    </div>
  );
}

function EmptyBenchmark({
  onUpload
}: {
  onUpload: () => void;
}) {
  return (
    <div className="flex min-h-[390px] flex-col">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
          <TrendingUp className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-bold text-slate-950 dark:text-slate-100">{'Industry Benchmark'}</h2>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5 text-white/30">
          <TrendingUp className="h-8 w-8" />
        </div>
        <p className="text-white/50">{'Complete an AI review to see how you compare'}</p>
        <button type="button" onClick={onUpload} className="mt-6 font-bold text-white hover:text-white/80">
          {'Get your first review'} →
        </button>
      </div>
    </div>
  );
}

function ReviewSummary({
  review,
  onFix,
  isFixing
}: {
  review: AiReviewClientReview;
  onFix: () => void;
  isFixing: boolean;
}) {
  const scoreTone = review.score >= 70 ? 'text-emerald-500' : review.score >= 55 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="flex min-h-[390px] flex-col">
      <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-bold text-white">{"We'll help rebuild fast - unlock your job-ready plan"}</p>
          <Button onClick={onFix} disabled={isFixing} className="rounded-xl bg-white text-slate-950 hover:bg-white/90">
            {isFixing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LockKeyhole className="mr-2 h-4 w-4" />}
            {'Fix CV'}
          </Button>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <ScoreDonut score={review.score} />
        <h3 className={`mt-6 text-2xl font-black ${scoreTone}`}>{review.analysis.rating} - {review.headline}</h3>
        <p className="mt-3 max-w-md text-sm text-white/50">
          {'Unlock deterministic findings into rewritten bullets, structure fixes, and a clean editable CV.'}
        </p>
      </div>
    </div>
  );
}

function ResultPanel({
  review,
  onFix,
  isFixing,
  fixCreditCost
}: {
  review: AiReviewClientReview;
  onFix: () => void;
  isFixing: boolean;
  fixCreditCost: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-sm">
      <div className="mb-7 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-black text-white">{'Unlock Full Review'}</p>
            <p className="text-sm text-white/50">{fixCreditCost} {'credits for a new fixed CV'}</p>
          </div>
          <Button onClick={onFix} disabled={isFixing} className="rounded-xl bg-white px-5 text-slate-950 hover:bg-white/90">
            {isFixing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {'Get Job-Ready Review'}
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <ScoreDonut score={review.score} />
        <h2 className="mt-6 text-center text-2xl font-black text-white">{review.analysis.rating}</h2>
        <p className="mt-2 text-center text-sm text-white/50">{review.headline}</p>
      </div>
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2 font-black text-white">
          <BarChart3 className="h-5 w-5" />
          {'Category Breakdown'}
        </div>
        <div className="space-y-3">
          {Object.entries(review.analysis.breakdown).map(([key, value]) => {
            const typedKey = key as keyof ReviewAnalysis['breakdown'];
            const max = review.analysis.maxBreakdown[typedKey];
            return (
              <div key={key} className="grid grid-cols-[92px_1fr_56px] items-center gap-3 text-sm">
                <span className="text-white/50">{BREAKDOWN_LABELS[typedKey]}</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-white" style={{ width: `${Math.round((value / max) * 100)}%` }} />
                </div>
                <span className="text-right font-bold text-white/80">{value}/{max}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-8">
        <h3 className="mb-3 font-black text-white">{'Deterministic Findings'}</h3>
        <div className="space-y-3">
          {review.analysis.findings.slice(0, 6).map((finding) => (
            <div key={finding.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="font-bold text-white">{finding.title}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${finding.severity === 'critical' ? 'bg-rose-500/10 text-rose-500' : finding.severity === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-orange-500/10 text-orange-500'}`}>
                  {finding.severity}
                </span>
              </div>
              <p className="text-sm text-white/50">{finding.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoreDonut({ score }: { score: number }) {
  return (
    <div
      className="relative flex h-40 w-40 items-center justify-center rounded-full"
      style={{ background: `conic-gradient(#f97316 ${score * 3.6}deg, rgba(255,255,255,0.1) 0deg)` }}
    >
      <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-zinc-950">
        <span className="text-5xl font-black text-white">{score}</span>
        <span className="text-sm font-semibold text-white/50">/ 100</span>
      </div>
    </div>
  );
}

function ResumePreview({ review }: { review: AiReviewClientReview }) {
  const cvState = useMemo(() => normalizedResumeToCvState(review.normalizedResume), [review.normalizedResume]);
  const scale = 0.55;

  if (review.filePath && review.fileType === 'pdf') {
    return (
      <>
        {/* Desktop View */}
        <div className="hidden h-[620px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 md:block">
          <iframe src={`/api/ai-review/${review.id}/file`} className="h-full w-full border-0" title={review.fileName} />
        </div>
        
        {/* Mobile View Fallback */}
        <div className="flex flex-col gap-4 md:hidden">
          <div className="flex items-center justify-between rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">Orijinal PDF</p>
                <p className="truncate text-xs text-white/50">{review.fileName}</p>
              </div>
            </div>
            <a 
              href={`/api/ai-review/${review.id}/file`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="shrink-0 rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-700"
            >
              PDF'i Aç
            </a>
          </div>
          <div className="h-[500px] overflow-auto rounded-2xl bg-slate-100 p-4 dark:bg-slate-950">
            <div style={{ width: CV_PAGE_WIDTH_PX * scale, height: CV_PAGE_HEIGHT_PX * scale }}>
              <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: CV_PAGE_WIDTH_PX }}>
                <CVTemplate cv={cvState} previewMode />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="h-[620px] overflow-auto rounded-2xl bg-slate-100 p-4 dark:bg-slate-950">
      <div style={{ width: CV_PAGE_WIDTH_PX * scale, height: CV_PAGE_HEIGHT_PX * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: CV_PAGE_WIDTH_PX }}>
          <CVTemplate cv={cvState} previewMode />
        </div>
      </div>
    </div>
  );
}

function BillingModal({
  open,
  onOpenChange,
  packages,
  fixCreditCost,
  billingSchemaMissing
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packages: BillingPackageView[];
  fixCreditCost: number;
  billingSchemaMissing: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[94vw] max-w-5xl overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-0 text-white shadow-2xl">
        <DialogHeader className="border-b border-white/10 p-7">
          <DialogTitle className="text-3xl font-black">{'Unlock Full Review'}</DialogTitle>
          <DialogDescription className="text-white/60">
            {'You need credits to create a new fixed CV.'} {fixCreditCost} {'credits required.'}
          </DialogDescription>
        </DialogHeader>

        <div className="p-7">
          {billingSchemaMissing ? (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              Billing şeması henüz uygulanmamış. Satın alma için `supabase/schema.sql` dosyasını SQL Editor’da çalıştırın.
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.code}
                className={`rounded-2xl border p-5 ${
                  pkg.highlight
                    ? 'border-white/30 bg-white/10 shadow-xl'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-white">{pkg.name}</h3>
                    <p className="mt-1 text-sm text-white/50">{pkg.credits} credits</p>
                  </div>
                  <span className="text-lg font-black text-white">{pkg.priceLabel}</span>
                </div>
                <CheckoutButton
                  packageCode={pkg.code}
                  label={'Buy Credits'}
                  theme="dark"
                  className="w-full rounded-xl bg-white text-slate-950 hover:bg-white/90"
                />
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function recomputeStats(reviews: AiReviewClientReview[], targetScore: number): AiReviewStats {
  const scores = reviews.map((review) => review.score).filter((score) => Number.isFinite(score));
  return {
    targetScore,
    bestScore: scores.length > 0 ? Math.max(...scores) : null,
    avgScore: scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null,
    reviewCount: reviews.length,
  };
}

function normalizedResumeToCvState(resume: NormalizedResume): CVState {
  return {
    id: resume.rawTextHash || 'ai-review-preview',
    title: resume.title || 'Uploaded Resume',
    templateSlug: 'classic-ats',
    fontFamily: 'calibri',
    personalInfo: {
      fullName: resume.personalInfo.fullName,
      jobTitle: '',
      email: resume.personalInfo.email,
      phone: resume.personalInfo.phone,
      location: resume.personalInfo.location,
      linkedin: resume.personalInfo.linkedin,
      portfolio: resume.personalInfo.portfolio,
      github: resume.personalInfo.github,
      photoDataUrl: '',
    },
    summaryTitle: resume.summaryTitle || 'Profile Summary',
    summary: resume.summary || '',
    sections: resume.sections.map((section, sectionIndex) => ({
      id: `${section.concept}-${sectionIndex}`,
      title: section.title,
      position: sectionIndex,
      items: section.items.map((item, itemIndex) => ({
        id: `${section.concept}-${sectionIndex}-${itemIndex}`,
        title: item.title,
        subtitle: item.subtitle,
        date: item.date,
        location: item.location,
        bullets: item.bullets,
        position: itemIndex,
      })),
    })),
  };
}

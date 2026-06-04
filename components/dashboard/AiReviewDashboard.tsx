'use client';

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
import type { Locale } from '@/lib/locale';

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
  locale: Locale;
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
  locale,
  initialReviews,
  initialStats,
  billingPackages,
  fixCreditCost,
  billingSchemaMissing = false,
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
  const isTr = locale === 'tr';
  const t = (en: string, tr: string) => (isTr ? tr : en);

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
      toast.error(t('Please upload a resume file first.', 'Önce bir CV dosyası yükleyin.'));
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
        throw new Error(payload.error || t('Could not analyze this CV.', 'Bu CV analiz edilemedi.'));
      }

      const completedReview = payload.review;
      setLoadingProgress(100);
      setReviews((current) => {
        return [completedReview, ...current.filter((item) => item.id !== completedReview.id)];
      });
      setActiveReview(completedReview);
      setSelectedFile(null);
      toast.success(t('AI Review completed.', 'AI Review tamamlandı.'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('Review failed.', 'Analiz başarısız oldu.'));
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
          throw new Error(payload.error || t('Could not create fixed CV.', 'Düzeltilmiş CV oluşturulamadı.'));
        }

        router.push(`/cv/${payload.cvId}?fixed=true`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t('Fix failed.', 'Düzeltme başarısız oldu.'));
      }
    });
  };

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 text-slate-950 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
              <Brain className="h-4 w-4" />
              {t('Deterministic ontology scoring', 'Deterministik ontoloji skoru')}
            </div>
            <h1 className="text-4xl font-bold tracking-tight">{t('AI Resume Review', 'AI Resume Review')}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t(
                'Free analysis uses file extraction, schema normalization, ontology mapping, and weighted mathematical scoring. LLM is only used for paid CV fixes.',
                'Ücretsiz analiz dosya okuma, şema normalizasyonu, ontoloji eşleme ve ağırlıklı matematiksel skorla çalışır. LLM sadece ücretli CV fix için kullanılır.',
              )}
            </p>
          </div>
          <Button
            onClick={openFilePicker}
            className="h-12 rounded-2xl bg-slate-900 px-6 text-base font-bold text-white shadow-sm hover:bg-black dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
          >
            <Upload className="mr-2 h-5 w-5" />
            {t('Upload Resume', 'CV Yükle')}
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Target} label={t('Target Score', 'Hedef Skor')} value={`${stats.targetScore}+`} hint="Hire Zone" tone="emerald" />
        <MetricCard icon={TrendingUp} label={t('Your Best', 'En İyi Skor')} value={stats.bestScore === null ? '--' : String(stats.bestScore)} hint="/100" tone="slate" />
        <MetricCard icon={Brain} label={t('Reviews', 'Review')} value={String(stats.reviewCount)} hint={t('completed', 'tamamlandı')} tone="blue" />
        <MetricCard icon={Sparkles} label={t('Avg Score', 'Ortalama')} value={stats.avgScore === null ? '--' : String(stats.avgScore)} hint="/100" tone="amber" />
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-300">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-slate-100">{t('Upload New Resume', 'Yeni CV Yükle')}</h2>
              <p className="text-sm text-slate-500">PDF, DOCX, TXT · Max 10MB</p>
            </div>
          </div>

          <button
            type="button"
            onClick={openFilePicker}
            className="flex min-h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center transition hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-950/40 dark:hover:border-blue-400/40 dark:hover:bg-blue-400/5"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm dark:bg-slate-900">
              <Upload className="h-7 w-7" />
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-100">{t('Drag & drop or click to browse', 'Sürükle bırak ya da seçmek için tıkla')}</span>
            <span className="mt-1 text-sm text-slate-500">PDF or DOCX - Max 10MB</span>
          </button>

          <div className="mt-6 space-y-3">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{t("What you'll get:", 'Neler alacaksın:')}</p>
            {[
              t('Overall score out of 100', '100 üzerinden toplam skor'),
              t('ATS compatibility analysis', 'ATS uyumluluk analizi'),
              t('Keyword optimization tips', 'Anahtar kelime optimizasyon önerileri'),
              t('Section-by-section feedback', 'Bölüm bazlı geri bildirim'),
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Check className="h-4 w-4 text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {activeReview ? <ReviewSummary review={activeReview} locale={locale} onFix={fixActiveReview} isFixing={isPending} /> : <EmptyBenchmark locale={locale} onUpload={openFilePicker} />}
        </div>
      </section>

      {activeReview ? (
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 dark:text-slate-100">{activeReview.fileName}</h3>
                  <p className="text-xs text-slate-500">{new Date(activeReview.createdAt).toLocaleDateString(isTr ? 'tr-TR' : 'en-US')}</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-300">Ready</span>
            </div>
            <ResumePreview review={activeReview} />
          </div>

          <ResultPanel review={activeReview} locale={locale} onFix={fixActiveReview} isFixing={isPending} fixCreditCost={fixCreditCost} />
        </section>
      ) : null}

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-slate-100">{t('Review History', 'Review Geçmişi')}</h2>
          </div>
          <Button variant="outline" onClick={openFilePicker} className="rounded-xl">
            <Upload className="mr-2 h-4 w-4" />
            {t('New Review', 'Yeni Review')}
          </Button>
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
                    ? 'border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-950 dark:text-slate-100">{review.fileName}</p>
                    <p className="mt-1 text-xs text-slate-500">{review.headline}</p>
                  </div>
                  <span className="rounded-full bg-slate-950 px-2.5 py-1 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-950">{review.score}/100</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
            {t('Upload your first resume to create a deterministic review.', 'İlk deterministik review için CV yükleyin.')}
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
        onStart={startReview}
        locale={locale}
      />

      {isAnalyzing ? <AnalyzingOverlay locale={locale} progress={loadingProgress} /> : null}
      {isPending ? <FixingOverlay locale={locale} /> : null}

      <BillingModal
        open={billingOpen}
        onOpenChange={setBillingOpen}
        packages={billingPackages}
        fixCreditCost={fixCreditCost}
        billingSchemaMissing={billingSchemaMissing}
        locale={locale}
      />
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
    blue: 'bg-blue-500/10 text-blue-500',
    amber: 'bg-amber-500/10 text-amber-500',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <div className="mt-6 flex items-end gap-2">
        <span className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">{value}</span>
        <span className="pb-1 text-sm font-semibold text-emerald-500">{hint}</span>
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
  locale: Locale;
}) {
  const isTr = props.locale === 'tr';
  const t = (en: string, tr: string) => (isTr ? tr : en);
  const canGoNext = props.step === 0 ? Boolean(props.category) : props.step === 1 ? Boolean(props.field) : true;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="flex h-[92vh] max-h-[92vh] w-[94vw] max-w-6xl flex-col overflow-hidden rounded-[2rem] border-slate-200 bg-white p-0 text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
        <DialogHeader className="shrink-0 border-b border-slate-200 p-7 dark:border-slate-800">
          <DialogTitle className="text-3xl font-black">{t('AI Resume Review', 'AI Resume Review')}</DialogTitle>
          <DialogDescription>{wizardSubtitle(props.step, props.locale)}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-7">
          <StepIndicator step={props.step} locale={props.locale} />

          {props.selectedFile ? (
            <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <FileText className="mr-2 inline h-4 w-4" />
              {props.selectedFile.name} · {(props.selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </div>
          ) : null}

          {props.step === 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {AI_REVIEW_ONTOLOGY.categories.map((item) => {
                const Icon = CATEGORY_ICONS[item.id] || Target;
                const isSelected = props.category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => props.onCategorySelect(item.id)}
                    className={`rounded-3xl border p-7 text-center transition hover:-translate-y-0.5 hover:shadow-lg ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-slate-200 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950 dark:shadow-none'
                        : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-slate-500 shadow-sm dark:bg-slate-950 dark:text-slate-400">
                      <Icon className="h-9 w-9" />
                    </div>
                    <h3 className="text-xl font-black">{item.label}</h3>
                    <p className={`mt-2 text-sm ${isSelected ? 'text-slate-200 dark:text-slate-700' : 'text-slate-500'}`}>{item.description}</p>
                  </button>
                );
              })}
            </div>
          ) : null}

          {props.step === 1 ? (
            <div className="mx-auto max-w-5xl text-center">
              <h3 className="mb-2 text-3xl font-black">{AI_REVIEW_ONTOLOGY.categories.find((item) => item.id === props.category)?.label}</h3>
              <p className="mb-8 text-slate-500">{t('Select your specific field', 'Spesifik alanını seç')}</p>
              <div className="flex flex-wrap justify-center gap-3">
                {props.fieldsForCategory.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => props.onFieldSelect(item.id)}
                    className={`rounded-full border px-6 py-3 text-base font-bold transition ${
                      props.field === item.id
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950'
                        : 'border-slate-300 bg-transparent text-slate-700 hover:border-slate-500 dark:border-slate-700 dark:text-slate-200'
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
              <div className="flex flex-wrap justify-center gap-3">
                {AI_REVIEW_ONTOLOGY.experienceLevels.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => props.onExperienceSelect(level.id)}
                    className={`min-w-32 rounded-[2rem] border px-6 py-4 text-center transition ${
                      props.experienceLevel === level.id
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950'
                        : 'border-slate-300 bg-transparent text-slate-700 hover:border-slate-500 dark:border-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className="block text-lg font-black">{level.label}</span>
                    <span className="text-sm opacity-70">{level.range}</span>
                  </button>
                ))}
              </div>

              <label className="mt-9 block">
                <span className="mb-3 flex items-center gap-2 text-lg font-bold">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  {t('Add job description (optional)', 'İş tanımı ekle (opsiyonel)')}
                </span>
                <textarea
                  value={props.jobDescription}
                  onChange={(event) => props.onJobDescriptionChange(event.target.value)}
                  rows={6}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:focus:border-slate-400"
                  placeholder={t('Paste the job description to score keyword coverage mathematically.', 'Anahtar kelime kapsamını matematiksel skorlamak için iş tanımını yapıştır.')}
                />
              </label>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white p-4 shadow-[0_-12px_30px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => props.setStep(Math.max(0, props.step - 1))}
              disabled={props.step === 0}
              className="h-12 rounded-xl px-5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('Back', 'Geri')}
            </Button>

            {props.step < 2 ? (
              <Button
                onClick={() => props.setStep(Math.min(2, props.step + 1))}
                disabled={!canGoNext}
                className="h-12 rounded-xl bg-slate-900 px-7 text-white hover:bg-black dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
              >
                {t('Next', 'İleri')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={props.onStart} className="h-12 rounded-xl bg-slate-900 px-8 text-white hover:bg-black dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white">
                {t('Start Review', 'Review Başlat')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepIndicator({ step, locale }: { step: number; locale: Locale }) {
  const isTr = locale === 'tr';
  const labels = isTr ? ['Kategori', 'Alan', 'Deneyim'] : ['Category', 'Field', 'Experience'];

  return (
    <div className="mx-auto mb-10 flex max-w-3xl items-center justify-center">
      {labels.map((label, index) => {
        const isComplete = index < step;
        const isActive = index === step;
        return (
          <div key={label} className="flex items-center">
            <div className="text-center">
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black ${
                  isComplete || isActive
                    ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-950'
                    : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
                }`}
              >
                {isComplete ? <Check className="h-7 w-7" /> : index + 1}
              </div>
              <p className={`mt-3 text-sm font-bold ${isComplete || isActive ? 'text-slate-950 dark:text-slate-100' : 'text-slate-400'}`}>{label}</p>
            </div>
            {index < labels.length - 1 ? (
              <div className={`mx-5 h-1 w-24 rounded-full ${index < step ? 'bg-slate-900 dark:bg-slate-100' : 'bg-slate-300 dark:bg-slate-700'} sm:w-36`} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function wizardSubtitle(step: number, locale: Locale): string {
  const isTr = locale === 'tr';
  if (step === 0) return isTr ? 'Alan kategorini seç' : 'Select your field category';
  if (step === 1) return isTr ? 'Spesifik alanını seç' : 'Choose your specific field';
  return isTr ? 'Deneyim seviyeni ve opsiyonel iş tanımını ekle' : 'Set your experience level and optional job description';
}

function AnalyzingOverlay({ locale, progress }: { locale: Locale; progress: number }) {
  const lines = locale === 'tr'
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
        <div className="h-full bg-gradient-to-r from-slate-900 via-blue-600 to-emerald-500 transition-all duration-500 dark:from-slate-100 dark:via-blue-400 dark:to-emerald-400" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] bg-blue-500/10 text-blue-600 dark:text-blue-300">
          <Brain className="h-12 w-12 animate-pulse" />
          <div className="absolute inset-0 animate-ping rounded-[2rem] border border-blue-500/30" />
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

function FixingOverlay({ locale }: { locale: Locale }) {
  const lines = locale === 'tr'
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
        <div className="h-full w-full animate-pulse bg-gradient-to-r from-emerald-500 via-blue-600 to-indigo-500 transition-all duration-500 dark:from-emerald-400 dark:via-blue-400 dark:to-indigo-400" />
      </div>
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
          <Sparkles className="h-12 w-12 animate-pulse" />
          <div className="absolute inset-0 animate-ping rounded-[2rem] border border-emerald-500/30" />
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

function EmptyBenchmark({ locale, onUpload }: { locale: Locale; onUpload: () => void }) {
  const isTr = locale === 'tr';
  const t = (en: string, tr: string) => (isTr ? tr : en);

  return (
    <div className="flex min-h-[390px] flex-col">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
          <TrendingUp className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-bold text-slate-950 dark:text-slate-100">{t('Industry Benchmark', 'Sektör Benchmark')}</h2>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-slate-800">
          <TrendingUp className="h-8 w-8" />
        </div>
        <p className="text-slate-500">{t('Complete an AI review to see how you compare', 'Karşılaştırmayı görmek için ilk review’ünü tamamla')}</p>
        <button type="button" onClick={onUpload} className="mt-6 font-bold text-slate-900 hover:text-blue-700 dark:text-slate-100 dark:hover:text-blue-300">
          {t('Get your first review', 'İlk review’ünü al')} →
        </button>
      </div>
    </div>
  );
}

function ReviewSummary({ review, locale, onFix, isFixing }: { review: AiReviewClientReview; locale: Locale; onFix: () => void; isFixing: boolean }) {
  const isTr = locale === 'tr';
  const t = (en: string, tr: string) => (isTr ? tr : en);
  const scoreTone = review.score >= 70 ? 'text-emerald-500' : review.score >= 55 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="flex min-h-[390px] flex-col">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-bold text-slate-800 dark:text-slate-100">{t("We'll help rebuild fast - unlock your job-ready plan", 'Job-ready planı açarak hızlıca iyileştirelim')}</p>
          <Button onClick={onFix} disabled={isFixing} className="rounded-xl bg-slate-900 text-white hover:bg-black dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white">
            {isFixing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LockKeyhole className="mr-2 h-4 w-4" />}
            {t('Fix CV', 'CV’yi Fixle')}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <ScoreDonut score={review.score} />
        <h3 className={`mt-6 text-2xl font-black ${scoreTone}`}>{review.analysis.rating} - {review.headline}</h3>
        <p className="mt-3 max-w-md text-sm text-slate-500">
          {t(
            'Unlock deterministic findings into rewritten bullets, structure fixes, and a clean editable CV.',
            'Deterministik bulguları rewritten bullet, yapı düzeltmeleri ve temiz düzenlenebilir CV’ye dönüştür.',
          )}
        </p>
      </div>
    </div>
  );
}

function ResultPanel({
  review,
  locale,
  onFix,
  isFixing,
  fixCreditCost,
}: {
  review: AiReviewClientReview;
  locale: Locale;
  onFix: () => void;
  isFixing: boolean;
  fixCreditCost: number;
}) {
  const isTr = locale === 'tr';
  const t = (en: string, tr: string) => (isTr ? tr : en);

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-7 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-black text-slate-950 dark:text-slate-100">{t('Unlock Full Review', 'Full Review Aç')}</p>
            <p className="text-sm text-slate-500">{fixCreditCost} {t('credits for a new fixed CV', 'kredi ile yeni düzeltilmiş CV')}</p>
          </div>
          <Button onClick={onFix} disabled={isFixing} className="rounded-xl bg-slate-900 px-5 text-white hover:bg-black dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white">
            {isFixing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {t('Get Job-Ready Review', 'Job-Ready Review Al')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <ScoreDonut score={review.score} />
        <h2 className="mt-6 text-center text-2xl font-black text-slate-950 dark:text-slate-100">{review.analysis.rating}</h2>
        <p className="mt-2 text-center text-sm text-slate-500">{review.headline}</p>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2 font-black text-slate-950 dark:text-slate-100">
          <BarChart3 className="h-5 w-5" />
          {t('Category Breakdown', 'Kategori Dağılımı')}
        </div>
        <div className="space-y-3">
          {Object.entries(review.analysis.breakdown).map(([key, value]) => {
            const typedKey = key as keyof ReviewAnalysis['breakdown'];
            const max = review.analysis.maxBreakdown[typedKey];
            return (
              <div key={key} className="grid grid-cols-[92px_1fr_56px] items-center gap-3 text-sm">
                <span className="text-slate-500">{BREAKDOWN_LABELS[typedKey]}</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-slate-900 dark:bg-slate-100" style={{ width: `${Math.round((value / max) * 100)}%` }} />
                </div>
                <span className="text-right font-bold text-slate-700 dark:text-slate-200">{value}/{max}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-3 font-black text-slate-950 dark:text-slate-100">{t('Deterministic Findings', 'Deterministik Bulgular')}</h3>
        <div className="space-y-3">
          {review.analysis.findings.slice(0, 6).map((finding) => (
            <div key={finding.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="font-bold text-slate-950 dark:text-slate-100">{finding.title}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${finding.severity === 'critical' ? 'bg-rose-500/10 text-rose-500' : finding.severity === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  {finding.severity}
                </span>
              </div>
              <p className="text-sm text-slate-500">{finding.detail}</p>
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
      style={{ background: `conic-gradient(#0f172a ${score * 3.6}deg, #dbe4ef 0deg)` }}
    >
      <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900">
        <span className="text-5xl font-black text-slate-950 dark:text-slate-100">{score}</span>
        <span className="text-sm font-semibold text-slate-500">/ 100</span>
      </div>
    </div>
  );
}

function ResumePreview({ review }: { review: AiReviewClientReview }) {
  const cvState = useMemo(() => normalizedResumeToCvState(review.normalizedResume), [review.normalizedResume]);
  const scale = 0.55;

  if (review.filePath && review.fileType === 'pdf') {
    return (
      <div className="h-[620px] overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-950">
        <iframe src={`/api/ai-review/${review.id}/file`} className="h-full w-full border-0" title={review.fileName} />
      </div>
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
  billingSchemaMissing,
  locale,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packages: BillingPackageView[];
  fixCreditCost: number;
  billingSchemaMissing: boolean;
  locale: Locale;
}) {
  const isTr = locale === 'tr';
  const t = (en: string, tr: string) => (isTr ? tr : en);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[94vw] max-w-5xl overflow-y-auto rounded-[2rem] border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-950">
        <DialogHeader className="border-b border-slate-200 p-7 dark:border-slate-800">
          <DialogTitle className="text-3xl font-black">{t('Unlock Full Review', 'Full Review Aç')}</DialogTitle>
          <DialogDescription>
            {t('You need credits to create a new fixed CV.', 'Yeni düzeltilmiş CV oluşturmak için kredi gerekir.')} {fixCreditCost} {t('credits required.', 'kredi gerekli.')}
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
                className={`rounded-3xl border p-5 ${
                  pkg.highlight
                    ? 'border-slate-900 bg-slate-50 shadow-lg shadow-slate-200 dark:border-slate-100 dark:bg-slate-900 dark:shadow-none'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-slate-950 dark:text-slate-100">{pkg.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{pkg.credits} credits</p>
                  </div>
                  <span className="text-lg font-black text-slate-950 dark:text-slate-100">{pkg.priceLabel}</span>
                </div>
                <CheckoutButton
                  packageCode={pkg.code}
                  label={t('Buy Credits', 'Kredi Satın Al')}
                  className="w-full rounded-xl bg-slate-900 text-white hover:bg-black dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
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

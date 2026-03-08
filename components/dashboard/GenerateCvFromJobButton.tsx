'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/locale';

type GenerateResponse = {
  cvId: string;
  cvState: unknown;
};

type GenerateCvFromJobButtonProps = {
  triggerClassName?: string;
  locale?: Locale;
};

export default function GenerateCvFromJobButton({ triggerClassName, locale = 'en' }: GenerateCvFromJobButtonProps) {
  const t = (en: string, tr: string) => (locale === 'tr' ? tr : en);

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const normalizedLength = useMemo(() => jobDescription.trim().length, [jobDescription]);

  const handleGenerate = async () => {
    setError('');

    if (normalizedLength < 40) {
      setError(t('Please provide a more detailed job description (minimum 40 characters).', 'Lütfen daha detaylı bir iş tanımı girin (en az 40 karakter).'));
      return;
    }

    setIsGenerating(true);
    try {
      const generateRes = await fetch('/api/cv/generate-from-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      });

      const generateData = (await generateRes.json().catch(() => null)) as GenerateResponse | { error?: string } | null;

      if (!generateRes.ok || !generateData || !('cvId' in generateData)) {
        const message =
          generateData && 'error' in generateData && typeof generateData.error === 'string'
            ? generateData.error
            : t('Could not generate CV draft. Please try again.', 'CV taslağı oluşturulamadı. Lütfen tekrar deneyin.');
        throw new Error(message);
      }

      const saveRes = await fetch('/api/cv/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generateData.cvState),
      });

      const saveData = (await saveRes.json().catch(() => null)) as { error?: string } | null;
      if (!saveRes.ok) {
        throw new Error(saveData?.error || t('Generated CV could not be saved.', 'Üretilen CV kaydedilemedi.'));
      }

      setOpen(false);
      router.push(`/cv/${generateData.cvId}?aiDraft=1`);
      router.refresh();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : t('Unexpected error occurred.', 'Beklenmeyen bir hata oluştu.');
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-11 gap-2 rounded-xl border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
            triggerClassName,
          )}
        >
          <Sparkles className="h-4 w-4" /> {t('Generate from Job Description', 'İş Tanımından Üret')}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('Generate CV with AI', 'AI ile CV Üret')}</DialogTitle>
          <DialogDescription>
            {t(
              'Paste the full job description. The more detailed your description, the better and more targeted the draft CV will be.',
              'Tam iş tanımını yapıştırın. Tanım ne kadar detaylı olursa üretilen taslak o kadar hedefli olur.',
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Textarea
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            className="min-h-[220px]"
            placeholder={t('Paste the complete job description here...', 'İş tanımını buraya yapıştırın...')}
            disabled={isGenerating}
          />
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {t(
                'Detailed requirements, tools, responsibilities and expectations improve quality.',
                'Detaylı gereksinimler, araçlar ve sorumluluklar kaliteyi artırır.',
              )}
            </span>
            <span className={normalizedLength >= 40 ? 'text-emerald-600' : 'text-slate-400'}>{normalizedLength} chars</span>
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isGenerating}>
            {t('Cancel', 'İptal')}
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || normalizedLength < 40} className="gap-2">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? t('Generating...', 'Üretiliyor...') : t('Generate CV', 'CV Üret')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Zap, AlertTriangle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useCV, CVState } from '@/context/CVContext';
import { Button } from '@/components/ui/button';
import { createBrowserClient } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type MatchResponse = {
  score: number;
  feedback: string;
  missingSkills: string[];
  extractedKeywords?: string[];
  embeddedKeywords?: string[];
  improvedCvState: CVState;
};

type JobMatcherProps = {
  locale: string;
};

export function JobMatcher({ locale }: JobMatcherProps) {
  const { state, dispatch } = useCV();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [matchResult, setMatchResult] = useState<MatchResponse | null>(null);
  const [isApplyingCurrent, setIsApplyingCurrent] = useState(false);
  const [isSavingAsNew, setIsSavingAsNew] = useState(false);

  const t = (en: string, tr: string) => (locale === 'tr' ? tr : en);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast.error(t('Please enter a job description first.', 'Lütfen önce bir iş tanımı girin.'));
      return;
    }

    setIsAnalyzing(true);
    setMatchResult(null);

    try {
      const response = await fetch('/api/cv/match-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription,
          cvState: state,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string; code?: string };
        if (response.status === 402 || payload.code === 'INSUFFICIENT_CREDITS') {
          throw new Error(t('Insufficient credits. Open Billing to continue.', 'Yetersiz kredi. Devam etmek için Ödeme sayfasını açın.'));
        }
        throw new Error(payload.error || 'Analysis failed');
      }

      const data = await response.json();
      setMatchResult(data);
    } catch (error) {
      console.error(error);
      toast.error(t('An error occurred during analysis.', 'Analiz sırasında bir hata oluştu.'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const buildAppliedState = () => {
    if (!matchResult?.improvedCvState) {
      return null;
    }

    const improved = matchResult.improvedCvState;

    return {
      ...state,
      ...improved,
      id: state.id,
      title: state.title,
      fontFamily: improved.fontFamily || state.fontFamily,
      summaryTitle: improved.summaryTitle || state.summaryTitle,
      summary: improved.summary || state.summary,
      personalInfo: improved.personalInfo || state.personalInfo,
      sections: Array.isArray(improved.sections) && improved.sections.length > 0 ? improved.sections : state.sections,
    } as CVState;
  };

  const handleApplyToCurrent = async () => {
    const nextState = buildAppliedState();
    if (!nextState) {
      return;
    }

    setIsApplyingCurrent(true);
    try {
      const saveRes = await fetch('/api/cv/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextState),
      });

      const payload = (await saveRes.json().catch(() => ({}))) as { error?: string };
      if (!saveRes.ok) {
        throw new Error(payload.error || 'Failed to save optimized CV');
      }

      dispatch({ type: 'SET_CV', payload: nextState });
      toast.success(t('CV updated with job keywords.', 'CV iş tanımı anahtar kelimeleriyle güncellendi.'));
      setIsOpen(false);
      setMatchResult(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(t('Could not apply changes to this CV.', 'Değişiklikler bu CV’ye uygulanamadı.'));
    } finally {
      setIsApplyingCurrent(false);
    }
  };

  const handleApplyAndSaveAsNew = async () => {
    const optimizedState = buildAppliedState();
    if (!optimizedState) return;

    setIsSavingAsNew(true);
    try {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error(t('Please log in first.', 'Lütfen önce giriş yapın.'));
        setIsSavingAsNew(false);
        return;
      }

      // Create new CV record
      const newId = crypto.randomUUID();
      const newTitle = `${state.title} (${t('TAILORED', 'UYARLANDI')})`;
      
      const { error: insertError } = await supabase
        .from('cvs')
        .insert([{ id: newId, user_id: user.id, title: newTitle }]);

      if (insertError) {
        throw insertError;
      }

      // Construct deeply copied improved state with new ID
      const newCvState: CVState = {
        ...optimizedState,
        id: newId,
        title: newTitle,
      };

      // Save the new sections and items to database
      const saveRes = await fetch('/api/cv/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCvState),
      });

      if (!saveRes.ok) throw new Error('Failed to save new CV');

      toast.success(t('New tailored CV created!', 'Yeni uyarlanan CV oluşturuldu!'));
      
      // Update local context and navigate
      dispatch({ type: 'SET_CV', payload: newCvState });
      setIsOpen(false);
      setMatchResult(null);
      router.push(`/cv/${newId}`);
      
    } catch (error) {
        console.error(error);
        toast.error(t('Could not save the new CV.', 'Yeni CV kaydedilemedi.'));
    } finally {
        setIsSavingAsNew(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 sm:w-auto dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
        >
          <Zap className="h-4 w-4" />
          <span className="sm:hidden">{t('Match Job', 'İlan Eşleştir')}</span>
          <span className="hidden sm:inline">{t('Match with Job', 'İş İlanıyla Eşleştir')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Zap className="h-5 w-5 text-blue-500" />
            {t('AI Match, Keywords & Optimize', 'Yapay Zeka ile Eşleştir, Anahtar Kelime Çıkar ve Optimize Et')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'Paste the job description below. AI will extract keywords, show what is missing, and update your CV text to match the role naturally.',
              'İş ilanını aşağıya yapıştırın. Yapay zeka anahtar kelimeleri çıkarır, eksikleri gösterir ve CV metnini role doğal şekilde uyarlayarak günceller.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <textarea
            className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-800"
            placeholder={t('Paste job description here...', 'İş ilanını buraya yapıştırın...')}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />

          {!matchResult && (
            <Button onClick={handleAnalyze} disabled={isAnalyzing || !jobDescription.trim()} className="w-full">
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('Analyzing...', 'Analiz ediliyor...')}
                </>
              ) : (
                t('Analyze Match', 'Uyumu Analiz Et')
              )}
            </Button>
          )}

          {matchResult && (
            <div className="mt-2 space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{t('Match Score', 'Eşleşme Skoru')}</h3>
                  <span className={`text-2xl font-bold ${matchResult.score >= 75 ? 'text-emerald-600' : matchResult.score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                    {matchResult.score}%
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {matchResult.feedback}
                </p>
              </div>

              {matchResult.extractedKeywords && matchResult.extractedKeywords.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-slate-700 dark:text-slate-300">
                    {t('Extracted Job Keywords', 'Çıkarılan İş Anahtar Kelimeleri')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.extractedKeywords.map((keyword) => (
                      <span key={keyword} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {matchResult.embeddedKeywords && matchResult.embeddedKeywords.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-emerald-700 dark:text-emerald-300">
                    {t('Keywords Embedded into CV', 'CV İçine Yerleştirilen Anahtar Kelimeler')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.embeddedKeywords.map((keyword) => (
                      <span key={keyword} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {matchResult.missingSkills && matchResult.missingSkills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <AlertTriangle className="h-4 w-4 text-amber-500"/> {t('Missing Keywords', 'Eksik Anahtar Kelimeler')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.missingSkills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-lg dark:bg-amber-900/30 dark:text-amber-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t dark:border-slate-800">
                <Button variant="ghost" onClick={() => setMatchResult(null)}>
                  {t('Back', 'Geri')}
                </Button>
                <Button onClick={handleApplyToCurrent} disabled={isApplyingCurrent || isSavingAsNew} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  {isApplyingCurrent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  {t('Apply to Current CV', 'Mevcut CV’ye Uygula')}
                </Button>
                <Button onClick={handleApplyAndSaveAsNew} disabled={isApplyingCurrent || isSavingAsNew} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isSavingAsNew ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                  {t('Save as New Tailored CV', 'Yeni Uyumlu CV Olarak Kaydet')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

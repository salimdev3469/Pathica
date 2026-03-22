'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Zap, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
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
        throw new Error('Analysis failed');
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

  const handleApplyAndSaveAsNew = async () => {
    if (!matchResult?.improvedCvState) return;

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
      const newCvState = {
        ...matchResult.improvedCvState,
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
        <Button variant="outline" className="gap-2 shrink-0 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900">
          <Zap className="h-4 w-4" />
          {t('Match with Job', 'İş İlanıyla Eşleştir')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Zap className="h-5 w-5 text-blue-500" />
            {t('AI Match & Optimize', 'Yapay Zeka ile Eşleştir ve Optimize Et')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'Paste the job description below. Our AI will analyze your CV, provide a score, show missing keywords, and automatically optimize your text.',
              'İş ilanını aşağıya yapıştırın. Yapay zeka CV\'nizi analiz edip skorlayacak, eksik anahtar kelimeleri gösterecek ve kelimelerinizi ilanla eşleşecek şekilde oto-optimize edecek.'
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
                <Button onClick={handleApplyAndSaveAsNew} disabled={isSavingAsNew} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isSavingAsNew ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                  {t('Apply Changes & Save as New CV', 'Değişiklikleri Uygula ve Yeni CV Olarak Kaydet')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { ChevronRight, FileEdit, LayoutTemplate, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Locale } from '@/lib/locale';

export function BuilderOnboardingModal({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const isTr = locale === 'tr';

  const t = (en: string, tr: string) => (isTr ? tr : en);

  useEffect(() => {
    const hasSeen = localStorage.getItem('pathica_builder_tour_v1');
    if (!hasSeen) {
      // Small delay to let the UI render
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleFinish = () => {
    localStorage.setItem('pathica_builder_tour_v1', 'true');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dark overlay with some opacity */}
      <div className="absolute inset-0 bg-black/60 pointer-events-auto transition-opacity" onClick={handleFinish} />

      {step === 1 && (
        <div className="absolute top-1/3 left-1/2 md:left-[30%] -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-80 bg-blue-600 rounded-3xl p-6 text-white shadow-2xl pointer-events-auto animate-in zoom-in-95 fade-in duration-300 border border-blue-400/30">
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-t-[16px] border-t-blue-600 border-r-[12px] border-r-transparent hidden md:block" />
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 font-bold text-lg">
              <FileEdit className="h-5 w-5 text-blue-200" />
              {t('Fill your details', 'Bilgilerinizi Doldurun')}
            </div>
            <button onClick={handleFinish} className="text-white/70 hover:text-white transition bg-white/10 rounded-full p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-blue-100 text-sm mb-6 leading-relaxed">
            {t(
              'Use the form here to enter your experiences, education, and skills. Everything you type is automatically saved.',
              'Deneyimlerinizi, eğitiminizi ve yeteneklerinizi girmek için bu formu kullanın. Yazdığınız her şey otomatik kaydedilir.'
            )}
          </p>
          <div className="flex justify-between items-center border-t border-blue-500/50 pt-4">
            <div className="flex gap-1.5">
              <div className="h-1.5 w-4 rounded-full bg-white" />
              <div className="h-1.5 w-1.5 rounded-full bg-white/30" />
            </div>
            <Button onClick={() => setStep(2)} className="h-9 rounded-xl bg-white text-blue-600 hover:bg-blue-50 px-5 text-sm font-bold shadow-sm">
              {t('Next', 'İleri')} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="absolute top-1/3 left-1/2 md:left-[70%] -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-80 bg-emerald-600 rounded-3xl p-6 text-white shadow-2xl pointer-events-auto animate-in zoom-in-95 fade-in duration-300 border border-emerald-400/30">
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-t-[16px] border-t-emerald-600 border-r-[12px] border-r-transparent hidden md:block" />
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 font-bold text-lg">
              <LayoutTemplate className="h-5 w-5 text-emerald-200" />
              {t('Live Preview', 'Canlı Önizleme')}
            </div>
            <button onClick={handleFinish} className="text-white/70 hover:text-white transition bg-white/10 rounded-full p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-emerald-100 text-sm mb-6 leading-relaxed">
            {t(
              'Watch your CV instantly update right here. It is already perfectly formatted for ATS systems!',
              'Buradan CV\'nizin anında güncellenmesini izleyin. ATS sistemleri için mükemmel formata zaten sahip!'
            )}
          </p>
          <div className="flex justify-between items-center border-t border-emerald-500/50 pt-4">
            <div className="flex gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-white/30" />
              <div className="h-1.5 w-4 rounded-full bg-white" />
            </div>
            <Button onClick={handleFinish} className="h-9 rounded-xl bg-white text-emerald-600 hover:bg-emerald-50 px-5 text-sm font-bold shadow-sm">
              {t("Got it!", 'Anladım!')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

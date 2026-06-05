'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, FileEdit, LayoutTemplate, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { type Locale } from '@/lib/locale';

export default function NewCvOnboarding({ locale, children, className }: { locale: Locale; children?: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const isTr = locale === 'tr';

  const t = (en: string, tr: string) => (isTr ? tr : en);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className || "h-11 gap-2 rounded-xl bg-blue-600 px-5 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"}>
          {children || <><Plus className="h-4 w-4" /> {t('New CV', 'Yeni CV')}</>}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-full w-full max-w-none flex-col gap-0 overflow-hidden border-0 bg-[#05070b] p-0 text-white sm:h-[80vh] sm:w-[90vw] sm:max-w-4xl sm:rounded-[2rem] sm:border sm:border-white/10 sm:shadow-2xl">
        <DialogHeader className="shrink-0 border-b border-white/10 p-6 sm:p-8">
          <DialogTitle className="text-2xl font-black sm:text-3xl">
            {t('How to use the CV Builder', 'CV Oluşturucu Nasıl Kullanılır?')}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {t("Let's take a quick look at how you'll build your resume.", 'Özgeçmişinizi nasıl oluşturacağınıza kısaca göz atalım.')}
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center p-6 sm:p-10">
          {step === 1 && (
            <div className="flex animate-in fade-in slide-in-from-bottom-4 flex-col items-center text-center duration-500">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-500 shadow-[0_0_40px_rgba(37,99,235,0.2)]">
                <FileEdit className="h-12 w-12" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">{t('Fill your details', 'Bilgilerinizi Doldurun')}</h3>
              <p className="max-w-sm text-base text-white/60">
                {t(
                  'Use the form on the left side of the screen to enter your experiences, education, and skills.',
                  'Ekranın sol tarafındaki formu kullanarak deneyimlerinizi, eğitiminizi ve yeteneklerinizi girin.',
                )}
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="flex animate-in fade-in slide-in-from-bottom-4 flex-col items-center text-center duration-500">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                <LayoutTemplate className="h-12 w-12" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">{t('See real-time preview', 'Gerçek Zamanlı Önizleme')}</h3>
              <p className="max-w-sm text-base text-white/60">
                {t(
                  'Watch your CV instantly update on the right side. It is already perfectly formatted for ATS systems!',
                  'Sağ tarafta CV\'nizin anında güncellenmesini izleyin. ATS sistemleri için mükemmel bir formata zaten sahip!',
                )}
              </p>
            </div>
          )}

          <div className="absolute bottom-6 flex gap-2 sm:bottom-10">
            <div className={`h-2 w-12 rounded-full transition-colors ${step === 1 ? 'bg-blue-600' : 'bg-white/10'}`} />
            <div className={`h-2 w-12 rounded-full transition-colors ${step === 2 ? 'bg-blue-600' : 'bg-white/10'}`} />
          </div>
        </div>

        <div className="shrink-0 border-t border-white/10 p-6 sm:p-8">
          <div className="flex justify-end">
            {step === 1 ? (
              <Button
                onClick={() => setStep(2)}
                className="h-12 w-full rounded-xl bg-blue-600 text-lg font-bold text-white hover:bg-blue-700 sm:w-auto sm:px-10"
              >
                {t('Next', 'İleri')} <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                asChild
                className="h-12 w-full rounded-xl bg-emerald-600 text-lg font-bold text-white hover:bg-emerald-700 sm:w-auto sm:px-10"
              >
                <Link href="/cv/new">{t("Let's Start", 'Hadi Başlayalım')}</Link>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

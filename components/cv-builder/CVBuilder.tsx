'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Briefcase, GraduationCap, Code, FolderGit2, Save, Loader2, FileText, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { Locale } from '@/lib/locale';
import { useCV, Section } from '@/context/CVContext';
import { SectionCard } from './SectionCard';
import { PersonalInfoForm } from './PersonalInfoForm';
import { JobMatcher } from './JobMatcher';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createBrowserClient } from '@/lib/supabase';
import { CV_FONT_OPTIONS } from '@/lib/cv-fonts';

type CVBuilderProps = {
  locale?: Locale;
};

export function CVBuilder({ locale = 'en' }: CVBuilderProps) {
  const t = (en: string, tr: string) => (locale === 'tr' ? tr : en);

  const PREBUILT_SECTIONS = [
    {
      title: t('Experience', 'Deneyim'),
      icon: <Briefcase size={16} />,
      items: [
        {
          title: t('Company Name', 'Şirket Adı'),
          subtitle: t('Job Title', 'Pozisyon'),
          date: 'Jan 2020 - Present',
          location: t('City, Country', 'Şehir, Ülke'),
          bullets: t('- Achieved X by doing Y\n- Led a team of Z', '- X hedefine Y ile ulaşıldı\n- Z kişilik ekip yönetildi'),
        },
      ],
    },
    {
      title: t('Education', 'Eğitim'),
      icon: <GraduationCap size={16} />,
      items: [
        {
          title: t('University Name', 'Üniversite Adı'),
          subtitle: t('Degree Name', 'Bölüm / Derece'),
          date: 'Aug 2016 - May 2020',
          location: t('City, Country', 'Şehir, Ülke'),
          bullets: '- GPA: 3.8/4.0',
        },
      ],
    },
    {
      title: t('Projects', 'Projeler'),
      icon: <FolderGit2 size={16} />,
      items: [
        {
          title: t('Project Name', 'Proje Adı'),
          subtitle: t('Tech Stack (React, Node.js)', 'Teknoloji (React, Node.js)'),
          date: 'Jan 2023',
          location: '',
          bullets: t('- Built application using X, improving Y by Z%', '- X ile uygulama geliştirildi, Y metriğinde Z% iyileşme sağlandı'),
        },
      ],
    },
    {
      title: t('Technical Skills', 'Teknik Beceriler'),
      icon: <Code size={16} />,
      items: [
        { title: t('Languages', 'Diller'), subtitle: '', date: '', location: '', bullets: 'Python, SQL, JavaScript' },
        { title: t('Frameworks', 'Frameworkler'), subtitle: '', date: '', location: '', bullets: 'React, Next.js, Django' },
      ],
    },
  ];

  const { state, dispatch } = useCV();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [backHref, setBackHref] = useState('/');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialSnapshotRef = useRef<string>(JSON.stringify(state));
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAiDraft = searchParams.get('aiDraft') === '1';

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) {
        return;
      }
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const currentSnapshot = JSON.stringify(state);
    setHasUnsavedChanges(currentSnapshot !== initialSnapshotRef.current);
  }, [state]);

  useEffect(() => {
    let isMounted = true;

    async function loadAuthState() {
      try {
        const supabase = createBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (isMounted) {
          const loggedIn = Boolean(user);
          setIsAuthenticated(loggedIn);
          setBackHref(loggedIn ? '/dashboard' : '/');
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
          setBackHref('/');
        }
      }
    }

    loadAuthState();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleBack = () => {
    if (!hasUnsavedChanges) {
      router.push(backHref);
      return;
    }

    setIsLeaveDialogOpen(true);
  };

  const handleConfirmLeave = () => {
    if (hasUnsavedChanges) {
      try {
        const restoredState = JSON.parse(initialSnapshotRef.current);
        dispatch({ type: 'SET_CV', payload: restoredState });
      } catch {
        // no-op
      }
    }

    setIsLeaveDialogOpen(false);
    router.push(backHref);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/cv/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      if (!res.ok) throw new Error('Failed to save');

      initialSnapshotRef.current = JSON.stringify(state);
      setHasUnsavedChanges(false);
      toast.success(t('CV saved successfully!', 'CV başarıyla kaydedildi!'));
    } catch {
      toast.error(t('Could not save CV. Please try again.', 'CV kaydedilemedi. Lütfen tekrar deneyin.'));
    } finally {
      setIsSaving(false);
    }
  };

  const addCustomSection = () => {
    dispatch({ type: 'ADD_SECTION', payload: { title: t('New Section', 'Yeni Bölüm') } });
    setIsPopoverOpen(false);
  };

  const addPrebuiltSection = (template: (typeof PREBUILT_SECTIONS)[0]) => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      title: template.title,
      position: state.sections.length,
      items: template.items.map((it, i) => ({
        id: crypto.randomUUID(),
        title: it.title,
        subtitle: it.subtitle,
        date: it.date,
        location: it.location,
        bullets: it.bullets,
        position: i,
      })),
    };

    dispatch({
      type: 'SET_CV',
      payload: {
        ...state,
        sections: [...state.sections, newSection],
      },
    });

    setIsPopoverOpen(false);
  };

  return (
    <div className="custom-scrollbar mx-auto w-full max-w-2xl flex-1 px-4 py-6 md:overflow-y-auto md:p-8 relative">
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <Button onClick={() => document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-full shadow-2xl h-14 px-6 text-lg">
           <FileText className="mr-2" /> {t('Preview PDF', 'PDF Önizle')}
        </Button>
      </div>
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Leave without saving?', 'Kaydetmeden çıkılsın mı?')}</DialogTitle>
            <DialogDescription>
              {t('If you leave now, your unsaved changes will be discarded.', 'Şimdi çıkarsan kaydedilmemiş değişiklikler silinecek.')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
              {t('Stay', 'Kal')}
            </Button>
            <Button variant="destructive" onClick={handleConfirmLeave}>
              {t('Leave', 'Çık')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="-ml-3 px-3 text-slate-500 hover:bg-slate-100/50 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100">
          <ArrowLeft className="mr-2 h-4 w-4" /> {isAuthenticated ? t('Back to Dashboard', 'Panoya Dön') : t('Back to Landing', 'Anasayfaya Dön')}
        </Button>
      </div>

      {isAiDraft && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">{t('AI Draft Loaded', 'AI Taslağı Yüklendi')}</p>
          <p className="mt-1 leading-relaxed">
            {t(
              'This draft was generated in English from your input and may include mock suggestions. Review every section and replace all placeholders and "Recommendation:" lines with your real details before applying.',
              'Bu taslak girdinizden İngilizce olarak üretildi ve örnek öneriler içerebilir. Başvurmadan önce tüm bölümleri kontrol edin, tüm placeholder ve "Recommendation:" satırlarını gerçek bilgilerinizle değiştirin.',
            )}
          </p>
        </div>
      )}

      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex-1">
          <input
            value={state.title}
            onChange={(e) => dispatch({ type: 'UPDATE_TITLE', payload: e.target.value })}
            className="w-full border-b-2 border-transparent bg-transparent pb-1 text-4xl font-bold outline-none transition-colors hover:border-slate-200 focus:border-primary"
            placeholder={t('CV Title', 'CV Başlığı')}
          />
          <p className="mt-2 text-slate-500">{t('Build your ATS-friendly CV by filling the info and adding sub-sections below. Drag-and-drop to reorder in the preview!', 'Bilgileri doldurup alt bölümler ekleyerek ATS uyumlu CV oluştur. Önizlemede sürükle-bırak ile sıralamayı değiştirebilirsin!')}</p>
          <div className="mt-4 max-w-xs">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t('CV Font', 'CV Yazı Tipi')}
            </label>
            <Select
              value={state.fontFamily}
              onValueChange={(value) => dispatch({ type: 'UPDATE_FONT_FAMILY', payload: value })}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder={t('Choose font', 'Yazı tipi seç')} />
              </SelectTrigger>
              <SelectContent>
                {CV_FONT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center shrink-0">
          {isAuthenticated && (
            <JobMatcher locale={locale} />
          )}
          {isAuthenticated && (
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t('Save CV', 'CV Kaydet')}
            </Button>
          )}
        </div>
      </div>

      <PersonalInfoForm locale={locale} />

      <div className="flex flex-col gap-4">
        {(state.sections || []).map((section) => (
          <SectionCard key={section.id} section={section} locale={locale} />
        ))}
      </div>

      <div className="mt-8 flex justify-center pb-20">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg transition-all hover:shadow-xl">
              <Plus className="mr-2" /> {t('Add Section', 'Bölüm Ekle')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" side="top" align="center">
            <div className="flex flex-col gap-1">
              <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('Pre-built Sections', 'Hazır Bölümler')}</div>
              {PREBUILT_SECTIONS.map((template) => (
                <Button
                  key={template.title}
                  variant="ghost"
                  className="h-9 justify-start font-normal"
                  onClick={() => addPrebuiltSection(template)}
                >
                  <span className="mr-2 text-slate-400">{template.icon}</span>
                  {template.title}
                </Button>
              ))}

              <div className="my-1 border-t"></div>

              <Button
                variant="ghost"
                className="h-9 justify-start font-normal text-primary hover:bg-primary/10 hover:text-primary"
                onClick={addCustomSection}
              >
                <FileText className="mr-2 h-4 w-4" />
                {t('Custom Section', 'Özel Bölüm')}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

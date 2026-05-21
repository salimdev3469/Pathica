'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Briefcase, GraduationCap, Code, FolderGit2, Save, Loader2, FileText, ArrowLeft, Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { Locale } from '@/lib/locale';
import { useCV, Section } from '@/context/CVContext';
import { SectionCard } from './SectionCard';
import { PersonalInfoForm } from './PersonalInfoForm';
import { JobMatcher } from './JobMatcher';
import { CvImportDialog } from './CvImportDialog';
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
import { getCvTemplateSeed, getLocalizedText, getCvTemplateDefaultFont } from '@/lib/cv-templates';

const GUEST_DRAFT_STORAGE_KEY = 'pathica_guest_cv_draft_v1';
const GUEST_EDIT_LOCK_THRESHOLD = 6;

type CVBuilderProps = {
  locale?: Locale;
  onOpenPreview?: () => void;
};

export function CVBuilder({ locale = 'en', onOpenPreview }: CVBuilderProps) {
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
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [backHref, setBackHref] = useState('/');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [guestEditCount, setGuestEditCount] = useState(0);
  const [isGuestLocked, setIsGuestLocked] = useState(false);
  const initialSnapshotRef = useRef<string>(JSON.stringify(state));
  const lastSnapshotRef = useRef<string>(JSON.stringify(state));
  const skipGuestEditCounterRef = useRef(false);
  const templateAppliedRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAiDraft = searchParams.get('aiDraft') === '1';
  const templateSlug = searchParams.get('template');
  const shouldRestoreGuestDraft = searchParams.get('restoreGuest') === '1';
  const authNext = '/cv/new?restoreGuest=1';
  const loginHref = `/login?next=${encodeURIComponent(authNext)}`;
  const registerHref = `/register?next=${encodeURIComponent(authNext)}`;

  const buildTemplateState = (templateSlugValue: string) => {
    const template = getCvTemplateSeed(templateSlugValue);
    if (!template) {
      return null;
    }

    const templateName = getLocalizedText(template.name, locale);
    const currentTitle = state.title?.trim();
    const untitledEn = t('Untitled CV', 'Başlıksız CV');
    const title = !currentTitle || currentTitle === untitledEn ? `${templateName} CV` : state.title;

    return {
      ...state,
      title,
      templateSlug: template.slug,
      fontFamily: getCvTemplateDefaultFont(template.slug),
      personalInfo: {
        ...state.personalInfo,
        fullName: template.personalInfo.fullName,
        jobTitle: getLocalizedText(template.personalInfo.jobTitle, locale),
        email: template.personalInfo.email,
        phone: template.personalInfo.phone,
        location: getLocalizedText(template.personalInfo.location, locale),
        linkedin: template.personalInfo.linkedin,
        portfolio: template.personalInfo.portfolio,
        github: template.personalInfo.github,
      },
      summaryTitle: getLocalizedText(template.summaryTitle, locale),
      summary: getLocalizedText(template.summary, locale),
      sections: template.sections.map((section, sectionIndex) => ({
        id: crypto.randomUUID(),
        title: getLocalizedText(section.title, locale),
        position: sectionIndex,
        items: section.items.map((item, itemIndex) => ({
          id: crypto.randomUUID(),
          title: getLocalizedText(item.title, locale),
          subtitle: getLocalizedText(item.subtitle, locale),
          date: item.date,
          location: getLocalizedText(item.location, locale),
          bullets: getLocalizedText(item.bullets, locale),
          position: itemIndex,
        })),
      })),
    };
  };

  const persistGuestDraftForAuth = () => {
    if (typeof window === 'undefined') {
      return;
    }
    sessionStorage.setItem(GUEST_DRAFT_STORAGE_KEY, JSON.stringify(state));
  };

  const saveState = async (cvState: typeof state, options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    setIsSaving(true);
    try {
      const res = await fetch('/api/cv/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cvState),
      });
      if (!res.ok) throw new Error('Failed to save');

      initialSnapshotRef.current = JSON.stringify(cvState);
      setHasUnsavedChanges(false);
      if (!silent) {
        toast.success(t('CV saved successfully!', 'CV başarıyla kaydedildi!'));
      }
      return true;
    } catch {
      toast.error(t('Could not save CV. Please try again.', 'CV kaydedilemedi. Lütfen tekrar deneyin.'));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

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
    const currentSnapshot = JSON.stringify(state);

    if (currentSnapshot === lastSnapshotRef.current) {
      return;
    }

    if (!isAuthLoaded) {
      lastSnapshotRef.current = currentSnapshot;
      return;
    }

    if (skipGuestEditCounterRef.current) {
      skipGuestEditCounterRef.current = false;
      lastSnapshotRef.current = currentSnapshot;
      return;
    }

    if (!isAuthenticated && !isGuestLocked) {
      setGuestEditCount((previousCount) => {
        const nextCount = previousCount + 1;
        if (nextCount >= GUEST_EDIT_LOCK_THRESHOLD) {
          setIsGuestLocked(true);
          if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        }
        return nextCount;
      });
    }

    lastSnapshotRef.current = currentSnapshot;
  }, [isAuthLoaded, isAuthenticated, isGuestLocked, state]);

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
          setIsAuthLoaded(true);
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
          setBackHref('/');
          setIsAuthLoaded(true);
        }
      }
    }

    loadAuthState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    if (templateAppliedRef.current) {
      return;
    }

    templateAppliedRef.current = true;

    const templateState = templateSlug && isAuthenticated ? buildTemplateState(templateSlug) : null;
    const hasTemplate = Boolean(templateState);
    const shouldHydrateDraft = shouldRestoreGuestDraft && isAuthenticated;

    if (!shouldHydrateDraft && !hasTemplate) {
      return;
    }

    let nextState = templateState;

    if (shouldHydrateDraft && typeof window !== 'undefined') {
      const rawDraft = sessionStorage.getItem(GUEST_DRAFT_STORAGE_KEY);
      if (rawDraft) {
        try {
          const parsedDraft = JSON.parse(rawDraft) as typeof state;
          nextState = {
            ...state,
            ...parsedDraft,
            id: state.id,
            title: parsedDraft.title || state.title,
          };
        } catch {
          nextState = templateState;
        }
      }
    }

    if (!nextState) {
      return;
    }

    skipGuestEditCounterRef.current = true;
    dispatch({ type: 'SET_CV', payload: nextState });
    lastSnapshotRef.current = JSON.stringify(nextState);

    if (shouldHydrateDraft) {
      void (async () => {
        const saved = await saveState(nextState, { silent: true });
        if (saved && typeof window !== 'undefined') {
          sessionStorage.removeItem(GUEST_DRAFT_STORAGE_KEY);
          toast.success(t('Draft restored. Continue editing your CV.', 'Taslak geri yüklendi. CV düzenlemeye devam edebilirsin.'));
        }
      })();
    }
  }, [
    dispatch,
    isAuthenticated,
    isAuthLoaded,
    locale,
    searchParams,
    shouldRestoreGuestDraft,
    state,
    templateSlug,
    t,
  ]);

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
    await saveState(state);
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
    <div
      className="custom-scrollbar relative mx-auto w-full max-w-2xl flex-1 overflow-y-auto overscroll-y-contain px-4 py-5 pb-8 md:min-h-0 md:p-8"
      style={{ fontFamily: "var(--font-geist-sans), 'Segoe UI', 'Noto Sans', Arial, sans-serif" }}
    >
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

      <div className={isGuestLocked ? 'pointer-events-none select-none opacity-55 blur-[1px]' : ''}>
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

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <input
              value={state.title}
              onChange={(e) => dispatch({ type: 'UPDATE_TITLE', payload: e.target.value })}
              className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap border-b-2 border-transparent bg-transparent pb-1 text-2xl font-bold leading-tight outline-none transition-colors hover:border-slate-200 focus:border-primary sm:text-3xl md:text-4xl xl:text-5xl"
              placeholder={t('CV Title', 'CV Başlığı')}
            />
            <p className="mt-2 text-lg leading-relaxed text-slate-500">{t('Build your ATS-friendly CV by filling the info and adding sub-sections below. Drag-and-drop to reorder in the preview!', 'Bilgileri doldurup alt bölümler ekleyerek ATS uyumlu CV oluştur. Önizlemede sürükle-bırak ile sıralamayı değiştirebilirsin!')}</p>
            <div className="mt-4 w-full max-w-md">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('Font & Letter Spacing', 'Yazı Tipi ve Harf Aralığı')}
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="w-full flex-1">
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
                <div className="w-full sm:w-28">
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={state.letterSpacing || ''}
                      placeholder="0"
                      onChange={(e) => dispatch({ type: 'SET_CV', payload: { ...state, letterSpacing: e.target.value === '' ? 0 : parseFloat(e.target.value) } })}
                      className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <span className="pointer-events-none absolute right-8 top-3 text-[10px] font-bold uppercase text-slate-400">px</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap lg:w-auto lg:flex-col lg:items-stretch">
            {onOpenPreview && (
              <Button
                type="button"
                variant="secondary"
                onClick={onOpenPreview}
                className="gap-2 md:hidden"
              >
                <Eye className="h-4 w-4" />
                {t('Preview PDF', 'PDF Önizle')}
              </Button>
            )}
            {isAuthenticated && (
              <CvImportDialog locale={locale} />
            )}
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

      {isGuestLocked && !isAuthenticated && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
              {t('Guest limit reached', 'Misafir limiti doldu')}
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              {t('Continue with your template by signing in', 'Şablonla devam etmek için giriş yap')}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {t(
                'You made a few edits. To keep editing and save this CV, continue from the login page. If you leave now, your guest draft will be lost.',
                'Birkaç düzenleme yaptın. CV düzenlemeye devam etmek ve kaydetmek için login sayfasından devam et. Şimdi çıkarsan misafir taslağın kaybolur.',
              )}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {t('Edits made in guest mode:', 'Misafir modunda yapılan düzenleme:')} {guestEditCount}
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Button asChild className="w-full" onClick={persistGuestDraftForAuth}>
                <Link href={loginHref}>{t('Go to Login', 'Login sayfasına git')}</Link>
              </Button>
              <Button asChild variant="outline" className="w-full" onClick={persistGuestDraftForAuth}>
                <Link href={registerHref}>{t('Create Account', 'Hesap oluştur')}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

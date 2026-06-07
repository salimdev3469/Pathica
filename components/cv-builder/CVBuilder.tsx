'use client';;
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Briefcase, GraduationCap, Code, FolderGit2, Save, Loader2, FileText, ArrowLeft, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useCV, Section, type CVState } from '@/context/CVContext';
import { SectionCard } from './SectionCard';
import { PersonalInfoForm } from './PersonalInfoForm';
import { CvImportDialog } from './CvImportDialog';
import { BuilderOnboardingModal } from './BuilderOnboardingModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { CV_PAGE_MARGIN_MAX_PX, CV_PAGE_MARGIN_MIN_PX, normalizeCvPageMargins } from '@/lib/cv-layout';

const GUEST_DRAFT_STORAGE_KEY = 'pathica_guest_cv_draft_v1';
const GUEST_EDIT_LOCK_THRESHOLD = 6;
const PAGE_MARGIN_PRESETS = [
  { key: 'compact', value: 36 },
  { key: 'default', value: 54 },
  { key: 'comfortable', value: 72 },
] as const;

type CVBuilderProps = {
  onOpenPreview?: () => void;
};

export function CVBuilder({ locale = 'en', onOpenPreview }: CVBuilderProps) {
  const PREBUILT_SECTIONS = [
    {
      title: 'Experience',
      icon: <Briefcase size={16} />,
      items: [
        {
          title: 'Company Name',
          subtitle: 'Job Title',
          date: 'Jan 2020 - Present',
          location: 'City, Country',
          bullets: '- Achieved X by doing Y\n- Led a team of Z',
        },
      ],
    },
    {
      title: 'Education',
      icon: <GraduationCap size={16} />,
      items: [
        {
          title: 'University Name',
          subtitle: 'Degree Name',
          date: 'Aug 2016 - May 2020',
          location: 'City, Country',
          bullets: '- GPA: 3.8/4.0',
        },
      ],
    },
    {
      title: 'Projects',
      icon: <FolderGit2 size={16} />,
      items: [
        {
          title: 'Project Name',
          subtitle: 'Tech Stack (React, Node.js)',
          date: 'Jan 2023',
          location: '',
          bullets: '- Built application using X, improving Y by Z%',
        },
      ],
    },
    {
      title: 'Technical Skills',
      icon: <Code size={16} />,
      items: [
        { title: 'Languages', subtitle: '', date: '', location: '', bullets: 'Python, SQL, JavaScript' },
        { title: 'Frameworks', subtitle: '', date: '', location: '', bullets: 'React, Next.js, Django' },
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
  const pageMargins = normalizeCvPageMargins(state.pageMargins);

  const buildTemplateState = (templateSlugValue: string): CVState | null => {
    const template = getCvTemplateSeed(templateSlugValue);
    if (!template) {
      return null;
    }

    const templateName = getLocalizedText(template.name, locale);
    const currentTitle = state.title?.trim();
    const untitledEn = 'Untitled CV';
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
        toast.success('CV saved successfully!');
      }
      return true;
    } catch {
      toast.error('Could not save CV. Please try again.');
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
          toast.success('Draft restored. Continue editing your CV.');
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
    dispatch({ type: 'ADD_SECTION', payload: { title: 'New Section' } });
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

  const handlePageMarginChange = (
    side: 'top' | 'right' | 'bottom' | 'left',
    rawValue: string,
  ) => {
    const parsed = rawValue === '' ? undefined : Number(rawValue);
    const nextMargins = normalizeCvPageMargins({
      ...pageMargins,
      [side]: Number.isFinite(parsed) ? parsed : pageMargins[side],
    });

    dispatch({ type: 'UPDATE_PAGE_MARGINS', payload: nextMargins });
  };

  const applyPageMarginPreset = (value: number) => {
    dispatch({
      type: 'UPDATE_PAGE_MARGINS',
      payload: {
        top: value,
        right: value,
        bottom: value,
        left: value,
      },
    });
  };

  return (
    <div
      className="custom-scrollbar relative mx-auto w-full max-w-2xl flex-1 overflow-y-auto overscroll-y-contain px-4 py-5 pb-8 md:min-h-0 md:p-8"
      style={{ fontFamily: "var(--font-geist-sans), 'Segoe UI', 'Noto Sans', Arial, sans-serif" }}
    >
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{'Leave without saving?'}</DialogTitle>
            <DialogDescription>
              {'If you leave now, your unsaved changes will be discarded.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
              {'Stay'}
            </Button>
            <Button variant="destructive" onClick={handleConfirmLeave}>
              {'Leave'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="-ml-3 px-3 text-slate-500 hover:bg-slate-100/50 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100">
          <ArrowLeft className="mr-2 h-4 w-4" /> {isAuthenticated ? 'Back to Dashboard' : 'Back to Landing'}
        </Button>
      </div>
      <div className={isGuestLocked ? 'pointer-events-none select-none opacity-55 blur-[1px]' : ''}>
        {isAiDraft && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-semibold">{'AI Draft Loaded'}</p>
            <p className="mt-1 leading-relaxed">
              {'Please edit your keyword-optimized CV according to your own information.'}
            </p>
          </div>
        )}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <input
              value={state.title}
              onChange={(e) => dispatch({ type: 'UPDATE_TITLE', payload: e.target.value })}
              className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap border-b-2 border-transparent bg-transparent pb-1 text-2xl font-bold leading-tight outline-none transition-colors hover:border-slate-200 focus:border-primary sm:text-3xl md:text-4xl xl:text-5xl"
              placeholder={'CV Title'}
            />
            <p className="mt-2 text-lg leading-relaxed text-slate-500">{'Build your ATS-friendly CV by filling the info and adding sub-sections below. Drag-and-drop to reorder in the preview!'}</p>
            <div className="mt-4 w-full max-w-md">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                {'Font & Letter Spacing'}
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="w-full flex-1">
                  <Select
                    value={state.fontFamily}
                    onValueChange={(value) => dispatch({ type: 'UPDATE_FONT_FAMILY', payload: value })}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder={'Choose font'} />
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
            <div className="mt-4 w-full max-w-xl">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {'Page Margins (A4 / px)'}
                </label>
                <div className="flex flex-wrap gap-1">
                  {PAGE_MARGIN_PRESETS.map((preset) => (
                    <Button
                      key={preset.key}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-[11px]"
                      onClick={() => applyPageMarginPreset(preset.value)}
                    >
                      {preset.key === 'compact'
                        ? 'Compact'
                        : preset.key === 'default'
                          ? 'Default'
                          : 'Comfortable'}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    onClick={() => applyPageMarginPreset(54)}
                  >
                    {'Reset'}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {([
                  { key: 'top', label: 'Top' },
                  { key: 'right', label: 'Right' },
                  { key: 'bottom', label: 'Bottom' },
                  { key: 'left', label: 'Left' },
                ] as const).map((item) => (
                  <div key={item.key}>
                    <label className="mb-1 block pl-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {item.label}
                    </label>
                    <Input
                      type="number"
                      min={CV_PAGE_MARGIN_MIN_PX}
                      max={CV_PAGE_MARGIN_MAX_PX}
                      step={1}
                      value={pageMargins[item.key]}
                      onChange={(event) => handlePageMarginChange(item.key, event.target.value)}
                      className="bg-white"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {'These margins are applied to the live A4 preview and the exported PDF.'}
              </p>
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
                {'Preview PDF'}
              </Button>
            )}
            {isAuthenticated && (
              <CvImportDialog />
            )}
            {isAuthenticated && (
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {'Save CV'}
              </Button>
            )}
          </div>
        </div>
        <PersonalInfoForm />

        <div className="flex flex-col gap-4">
          {(state.sections || []).map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>

        <div className="mt-8 flex justify-center pb-20">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button size="lg" className="rounded-full shadow-lg transition-all hover:shadow-xl">
                <Plus className="mr-2" /> {'Add Section'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" side="top" align="center">
              <div className="flex flex-col gap-1">
                <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">{'Pre-built Sections'}</div>
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
                  {'Custom Section'}
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
              {'Guest limit reached'}
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              {'Continue with your template by signing in'}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {'You made a few edits. To keep editing and save this CV, continue from the login page. If you leave now, your guest draft will be lost.'}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {'Edits made in guest mode:'} {guestEditCount}
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Button asChild className="w-full" onClick={persistGuestDraftForAuth}>
                <Link href={loginHref}>{'Go to Login'}</Link>
              </Button>
              <Button asChild variant="outline" className="w-full" onClick={persistGuestDraftForAuth}>
                <Link href={registerHref}>{'Create Account'}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
      <BuilderOnboardingModal />
    </div>
  );
}

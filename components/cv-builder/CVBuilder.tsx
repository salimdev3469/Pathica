'use client';

import React, { useState, useEffect } from 'react';
import { useCV, Section } from '@/context/CVContext';
import { SectionCard } from './SectionCard';
import { PersonalInfoForm } from './PersonalInfoForm';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Briefcase, GraduationCap, Code, FolderGit2, Save, Loader2, FileText, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';

const PREBUILT_SECTIONS = [
  {
    title: 'Experience',
    icon: <Briefcase size={16} />,
    items: [
      { title: 'Company Name', subtitle: 'Job Title', date: 'Jan 2020 - Present', location: 'City, Country', bullets: '- Achieved X by doing Y\n- Led a team of Z' }
    ]
  },
  {
    title: 'Education',
    icon: <GraduationCap size={16} />,
    items: [
      { title: 'University Name', subtitle: 'Degree Name', date: 'Aug 2016 - May 2020', location: 'City, Country', bullets: '- GPA: 3.8/4.0' }
    ]
  },
  {
    title: 'Projects',
    icon: <FolderGit2 size={16} />,
    items: [
      { title: 'Project Name', subtitle: 'Tech Stack (React, Node.js)', date: 'Jan 2023', location: '', bullets: '- Built application using X, improving Y by Z%' }
    ]
  },
  {
    title: 'Technical Skills',
    icon: <Code size={16} />,
    items: [
      { title: 'Languages', subtitle: '', date: '', location: '', bullets: 'Python, SQL, JavaScript' },
      { title: 'Frameworks', subtitle: '', date: '', location: '', bullets: 'React, Next.js, Django' }
    ]
  }
];

export function CVBuilder() {
  const { state, dispatch } = useCV();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [backHref, setBackHref] = useState('/');
  const router = useRouter();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadAuthState() {
      try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

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
    setIsLeaveDialogOpen(true);
  };

  const handleConfirmLeave = () => {
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
      toast.success('CV saved successfully!');
    } catch {
      toast.error('Could not save CV. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const addCustomSection = () => {
    dispatch({ type: 'ADD_SECTION', payload: { title: 'New Section' } });
    setIsPopoverOpen(false);
  };

  const addPrebuiltSection = (template: typeof PREBUILT_SECTIONS[0]) => {
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
        position: i
      }))
    };

    dispatch({
      type: 'SET_CV',
      payload: {
        ...state,
        sections: [...state.sections, newSection]
      }
    });

    setIsPopoverOpen(false);
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-2xl mx-auto custom-scrollbar">
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave without saving?</DialogTitle>
            <DialogDescription>
              If you leave now, your unsaved changes may be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
              Stay
            </Button>
            <Button variant="destructive" onClick={handleConfirmLeave}>
              Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 px-3 -ml-3">
          <ArrowLeft className="w-4 h-4 mr-2" /> {isAuthenticated ? 'Back to Dashboard' : 'Back to Landing'}
        </Button>
      </div>

      <div className="mb-8 flex justify-between items-start gap-4">
        <div className="flex-1">
          <input
            value={state.title}
            onChange={(e) => dispatch({ type: 'UPDATE_TITLE', payload: e.target.value })}
            className="text-4xl font-bold bg-transparent outline-none border-b-2 border-transparent hover:border-slate-200 focus:border-primary transition-colors pb-1 w-full"
            placeholder="CV Title"
          />
          <p className="text-slate-500 mt-2">Build your ATS-friendly CV by filling the info and adding sub-sections below. Drag-and-drop to reorder in the preview!</p>
        </div>
        {isAuthenticated && (
          <Button onClick={handleSave} disabled={isSaving} className="shrink-0 gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save CV
          </Button>
        )}
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
            <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all">
              <Plus className="mr-2" /> Add Section
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" side="top" align="center">
            <div className="flex flex-col gap-1">
              <div className="px-2 py-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Pre-built Sections
              </div>
              {PREBUILT_SECTIONS.map((template) => (
                <Button
                  key={template.title}
                  variant="ghost"
                  className="justify-start font-normal h-9"
                  onClick={() => addPrebuiltSection(template)}
                >
                  <span className="mr-2 text-slate-400">{template.icon}</span>
                  {template.title}
                </Button>
              ))}

              <div className="my-1 border-t"></div>

              <Button
                variant="ghost"
                className="justify-start font-normal h-9 text-primary hover:text-primary hover:bg-primary/10"
                onClick={addCustomSection}
              >
                <FileText className="mr-2 h-4 w-4" />
                Custom Section
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

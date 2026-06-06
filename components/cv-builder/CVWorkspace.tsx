'use client';;
import { useState } from 'react';
import { Eye, PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CVBuilder } from './CVBuilder';
import { CVPreview } from './CVPreview';
import { cn } from '@/lib/utils';

type CVWorkspaceProps = {
  showPostFixGuide?: boolean;
};

type MobilePanel = 'editor' | 'preview';

export function CVWorkspace({ locale = 'en', showPostFixGuide = false }: CVWorkspaceProps) {
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('editor');
  const [guideOpen, setGuideOpen] = useState(showPostFixGuide);

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-slate-50 md:flex-row">
      <div className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 px-3 py-2 backdrop-blur md:hidden">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          <Button
            type="button"
            variant={mobilePanel === 'editor' ? 'default' : 'ghost'}
            className="h-9 rounded-lg text-sm"
            onClick={() => setMobilePanel('editor')}
          >
            <PencilLine className="mr-1.5 h-4 w-4" />
            {'Editor'}
          </Button>
          <Button
            type="button"
            variant={mobilePanel === 'preview' ? 'default' : 'ghost'}
            className="h-9 rounded-lg text-sm"
            onClick={() => setMobilePanel('preview')}
          >
            <Eye className="mr-1.5 h-4 w-4" />
            {'Preview'}
          </Button>
        </div>
      </div>
      <div
        className={cn(
          'relative flex w-full min-h-0 flex-col overflow-hidden border-b bg-slate-50 md:h-full md:w-1/2 md:border-b-0 md:border-r',
          mobilePanel === 'preview' ? 'hidden md:flex' : 'flex-1',
        )}
      >
        <div className="absolute left-0 top-0 z-30 h-1 w-full bg-gradient-to-r from-primary to-blue-500 md:rounded-none" />
        <CVBuilder onOpenPreview={() => setMobilePanel('preview')} />
      </div>
      <div
        id="preview-section"
        className={cn(
          'relative z-0 w-full min-h-0 overflow-hidden bg-slate-200 shadow-inner md:h-full md:w-1/2',
          mobilePanel === 'preview' ? 'flex-1' : 'hidden md:block',
        )}
      >
        <CVPreview />
      </div>
      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {'Your CV is Fixed! 🎉'}
            </DialogTitle>
            <DialogDescription className="pt-2 text-base text-slate-600 dark:text-slate-400">
              {'The AI has perfectly restructured your resume to match your industry ontology. To maximize your final score, please follow these 2 simple steps:'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                1. {'Add Your Metrics'}
              </h4>
              <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
                {'AI strictly preserves your facts. You must manually add numbers and percentages (e.g. "Increased sales by 20%") to your experience bullets to pass generic ATS checks.'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                2. {'Upload Your Photo'}
              </h4>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {'ATS parsers strip images from PDFs. Click on "Personal Info" in the editor menu to re-upload your photo before exporting.'}
              </p>
            </div>
          </div>
          <div className="mt-2 flex justify-end">
            <Button onClick={() => setGuideOpen(false)} className="rounded-xl bg-slate-900 text-white hover:bg-black dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
              {"Got it! Let's edit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

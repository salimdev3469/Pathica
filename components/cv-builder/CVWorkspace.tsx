'use client';

import { useState } from 'react';
import { Eye, PencilLine } from 'lucide-react';
import type { Locale } from '@/lib/locale';
import { Button } from '@/components/ui/button';
import { CVBuilder } from './CVBuilder';
import { CVPreview } from './CVPreview';
import { cn } from '@/lib/utils';

type CVWorkspaceProps = {
  locale?: Locale;
};

type MobilePanel = 'editor' | 'preview';

export function CVWorkspace({ locale = 'en' }: CVWorkspaceProps) {
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('editor');
  const t = (en: string, tr: string) => (locale === 'tr' ? tr : en);

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
            {t('Editor', 'Editör')}
          </Button>
          <Button
            type="button"
            variant={mobilePanel === 'preview' ? 'default' : 'ghost'}
            className="h-9 rounded-lg text-sm"
            onClick={() => setMobilePanel('preview')}
          >
            <Eye className="mr-1.5 h-4 w-4" />
            {t('Preview', 'Önizleme')}
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
        <CVBuilder locale={locale} onOpenPreview={() => setMobilePanel('preview')} />
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
    </div>
  );
}

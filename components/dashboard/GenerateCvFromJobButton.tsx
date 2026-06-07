'use client';;
import { Loader2, Sparkles, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { cn } from '@/lib/utils';

type GenerateResponse = {
  cvId: string;
  cvState: unknown;
};

type GenerateCvFromJobButtonProps = {
  triggerClassName?: string;
};

export default function GenerateCvFromJobButton({ triggerClassName, locale = 'en' }: GenerateCvFromJobButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const normalizedLength = useMemo(() => jobDescription.trim().length, [jobDescription]);

  const handleGenerate = async () => {
    setError('');

    if (normalizedLength < 40) {
      setError('Please provide a more detailed job description (minimum 40 characters).');
      return;
    }

    setIsGenerating(true);
    try {
      const generateRes = await fetch('/api/cv/generate-from-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, jobDescription }),
      });

      const generateData = (await generateRes.json().catch(() => null)) as GenerateResponse | { error?: string } | null;

      if (!generateRes.ok || !generateData || !('cvId' in generateData)) {
        const message =
          generateData && 'error' in generateData && typeof generateData.error === 'string'
            ? generateData.error
            : 'Could not generate CV draft. Please try again.';
        throw new Error(message);
      }

      const saveRes = await fetch('/api/cv/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generateData.cvState),
      });

      const saveData = (await saveRes.json().catch(() => null)) as { error?: string } | null;
      if (!saveRes.ok) {
        throw new Error(saveData?.error || 'Generated CV could not be saved.');
      }

      setOpen(false);
      router.push(`/cv/${generateData.cvId}?aiDraft=1`);
      router.refresh();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unexpected error occurred.';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-11 gap-2 rounded-xl border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
            triggerClassName,
          )}
        >
          <Sparkles className="h-4 w-4" /> {'Generate from Job Description'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{'Generate CV with AI'}</DialogTitle>
          <DialogDescription>
            {'Paste the full job description. AI extracts role priorities, builds a targeted draft framework, and opens it in the editor for personalization.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Input
            value={jobTitle}
            onChange={(event) => setJobTitle(event.target.value)}
            placeholder={'Target role title (optional)'}
            disabled={isGenerating}
          />
          <Textarea
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            className="min-h-[220px]"
            placeholder={'Paste the complete job description here...'}
            disabled={isGenerating}
          />
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {'Detailed requirements, tools, responsibilities and expectations improve quality.'}
            </span>
            <span className={normalizedLength >= 40 ? 'text-emerald-600' : 'text-slate-400'}>{normalizedLength} chars</span>
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isGenerating}>
            {'Cancel'}
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || normalizedLength < 40} className="gap-2">
            <Sparkles className="h-4 w-4" />
            {'Generate CV'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    {isGenerating ? <GeneratingOverlay /> : null}
    </>
  );
}

function GeneratingOverlay() {
  const lines = [
    'Analyzing job description...',
    'Extracting core requirements...',
    'Building CV framework...',
    'Optimizing keywords for ATS...'
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setIndex((current) => (current + 1) % lines.length), 1800);
    return () => window.clearInterval(interval);
  }, [lines.length]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-white px-6 dark:bg-slate-950">
      <div className="absolute inset-x-0 bottom-0 h-2 bg-slate-200 dark:bg-slate-800">
        <div className="h-full w-full animate-pulse bg-gradient-to-r from-emerald-500 via-orange-600 to-indigo-500 transition-all duration-500 dark:from-emerald-400 dark:via-orange-400 dark:to-indigo-400" />
      </div>
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:text-blue-300">
          <Brain className="h-12 w-12 animate-pulse" />
          <div className="absolute inset-0 animate-ping rounded-2xl border border-orange-500/30" />
        </div>
        <TextShimmer
          key={lines[index]}
          as="p"
          duration={1.1}
          className="py-2 text-4xl font-semibold leading-[1.25] md:text-6xl [--base-color:#2563eb] [--base-gradient-color:#93c5fd]"
        >
          {lines[index]}
        </TextShimmer>
      </div>
    </div>
  );
}

'use client';;
import { Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
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
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? 'Generating...' : 'Generate CV'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

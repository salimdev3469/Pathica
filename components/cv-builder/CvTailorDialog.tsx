'use client';

import { useState } from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCV } from '@/context/CVContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function CvTailorDialog() {
  const { state, dispatch } = useCV();
  const [open, setOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [isTailoring, setIsTailoring] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (isTailoring) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setJobDescription('');
    }
  };

  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description first.');
      return;
    }

    setIsTailoring(true);

    try {
      const response = await fetch('/api/cv/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvState: state,
          jobDescription,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 402 && payload.code === 'INSUFFICIENT_CREDITS') {
          throw new Error(payload.error || 'Insufficient credits to use advanced AI tools.');
        }
        throw new Error(payload?.error || 'Could not tailor CV.');
      }

      if (!payload) {
        throw new Error('Received empty response from tailoring service.');
      }

      dispatch({ type: 'SET_CV', payload });

      toast.success('Your CV has been tailored for the job!');
      setOpen(false);
      setJobDescription('');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred during tailoring.';
      toast.error(message);
    } finally {
      setIsTailoring(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 sm:w-auto">
          <Wand2 className="h-4 w-4" />
          {'Tailor for Job'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{'Tailor Your CV for a Job'}</DialogTitle>
          <DialogDescription>
            {'Paste the job description below. Our AI will analyze the requirements and adjust your CV to highlight the most relevant skills and experiences. Everything will be generated in English.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{'Job Description'}</label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="min-h-[200px]"
              disabled={isTailoring}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isTailoring}>
            {'Cancel'}
          </Button>
          <Button onClick={handleTailor} disabled={isTailoring || !jobDescription.trim()} className="gap-2">
            {isTailoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {isTailoring ? 'Tailoring...' : 'Tailor CV'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

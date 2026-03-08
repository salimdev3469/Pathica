'use client';

import { useMemo, useState } from 'react';
import { Linkedin, Twitter, Copy, Check, Share2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type CvShareActionsProps = {
  cvId: string;
  cvTitle: string;
  atsScore: number | null;
};

const FIXED_SHARE_TEXT = 'I built an ATS-ready CV with Pathica. See the preview and create yours:';

function getBaseUrl() {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }

  return (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
}

export default function CvShareActions({ cvId, cvTitle, atsScore }: CvShareActionsProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const sharePayload = useMemo(() => {
    const baseUrl = getBaseUrl();
    const scoreParam = atsScore === null ? 'pending' : String(atsScore);
    const sharePath = `/share/cv/${cvId}?title=${encodeURIComponent(cvTitle)}&score=${encodeURIComponent(scoreParam)}`;
    const shareUrl = baseUrl ? `${baseUrl}${sharePath}` : sharePath;
    const message = `${FIXED_SHARE_TEXT} ${shareUrl}`;

    return {
      message,
      shareUrl,
      linkedinUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      twitterUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent('I built an ATS-ready CV with Pathica. See the preview:')}&url=${encodeURIComponent(shareUrl)}`,
    };
  }, [atsScore, cvId, cvTitle]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sharePayload.message);
      setIsCopied(true);
      toast.success('Share text copied');
      setTimeout(() => setIsCopied(false), 1500);
      setIsOpen(false);
    } catch {
      toast.error('Could not copy share text');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(sharePayload.shareUrl);
      toast.success('Share link copied');
      setIsOpen(false);
    } catch {
      toast.error('Could not copy share link');
    }
  };

  return (
    <div className="mb-3 flex items-center justify-end">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 rounded-lg border-slate-200 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-56 p-2">
          <div className="flex flex-col gap-1">
            <a
              href={sharePayload.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Linkedin className="h-4 w-4 text-[#0a66c2]" /> Share on LinkedIn
            </a>

            <a
              href={sharePayload.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Twitter className="h-4 w-4 text-sky-500" /> Share on X
            </a>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex h-9 items-center gap-2 rounded-md px-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Link2 className="h-4 w-4" /> Copy Share Link
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex h-9 items-center gap-2 rounded-md px-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {isCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />} Copy Share Text
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

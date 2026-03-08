'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CopyLinkButtonProps {
  url: string;
  label?: string;
}

export function CopyLinkButton({ url, label = 'Copy Share Link' }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      {copied ? 'Copied' : label}
    </Button>
  );
}

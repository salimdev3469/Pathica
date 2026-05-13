'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type CheckoutButtonProps = {
  packageCode: string;
  disabled?: boolean;
  className?: string;
  label?: string;
};

type CheckoutResponse = {
  checkoutUrl?: string;
  statusUrl?: string;
  error?: string;
};

export default function CheckoutButton({ packageCode, disabled = false, className, label = 'Buy Credits' }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageCode }),
      });

      const data = (await response.json().catch(() => ({}))) as CheckoutResponse;

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error || 'Could not start checkout.');
      }

      const opened = typeof window !== 'undefined' ? window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer') : null;
      if (opened && data.statusUrl) {
        window.location.href = data.statusUrl;
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Checkout failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={disabled || isLoading} className={className}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {label}
    </Button>
  );
}

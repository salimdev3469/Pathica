'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DodoPayments } from 'dodopayments-checkout';
import { Button } from '@/components/ui/button';
import { CHECKOUT_CONSENT_DOCUMENTS } from '@/lib/legal-pages';

type CheckoutButtonProps = {
  packageCode: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  theme?: 'light' | 'dark';
};

type CheckoutResponse = {
  checkoutUrl?: string;
  sessionId?: string;
  error?: string;
};

const LEGAL_WARNING_MESSAGE = 'You must accept the required agreements and policies to proceed with the payment.';

let isDodoInitialized = false;


export default function CheckoutButton({ packageCode, disabled = false, className, label = 'Buy Credits', theme = 'light' }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const consentId = `checkout-consent-${packageCode}`;

  useEffect(() => {
    if (!isDodoInitialized) {
      try {
        DodoPayments.Initialize({
          mode: process.env.NEXT_PUBLIC_DODO_ENV === 'live' ? 'live' : 'test',
          displayType: 'overlay',
          onEvent: (event) => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('dodo-checkout-event', { detail: event }));
            }
          },
        });
        isDodoInitialized = true;
      } catch (error) {
        console.error('Failed to initialize Dodo Payments SDK:', error);
      }
    }
    
    setSdkReady(isDodoInitialized);

    const handleDodoEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const event = customEvent.detail;
      if (!event) return;
      
      switch (event.event_type) {
        case 'checkout.opened':
        case 'checkout.closed':
        case 'checkout.error':
          setIsLoading(false);
          break;
      }

      if (event.event_type === 'checkout.error') {
        toast.error('Payment error. Please try again.');
      }
    };

    window.addEventListener('dodo-checkout-event', handleDodoEvent);
    return () => {
      window.removeEventListener('dodo-checkout-event', handleDodoEvent);
    };
  }, []);

  const handleClick = async () => {
    if (!isConsentChecked) {
      toast.error(LEGAL_WARNING_MESSAGE);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageCode,
          legalAccepted: true,
          legalAcceptedAt: new Date().toISOString(),
          legalAcceptedDocuments: CHECKOUT_CONSENT_DOCUMENTS.map((doc) => doc.href),
        }),
      });

      const data = (await response.json().catch(() => ({}))) as CheckoutResponse;

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error || 'Could not start checkout.');
      }

      if (sdkReady) {
        try {
          await DodoPayments.Checkout.open({
            checkoutUrl: data.checkoutUrl,
          });
        } catch (overlayError) {
          console.warn('Overlay checkout failed, redirecting:', overlayError);
          window.location.href = data.checkoutUrl;
        }
      } else {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Checkout failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className={`rounded-lg border p-3 ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50/70'}`}>
        <div className="flex items-start gap-2.5">
          <input
            id={consentId}
            type="checkbox"
            checked={isConsentChecked}
            onChange={(event) => setIsConsentChecked(event.target.checked)}
            className={`mt-0.5 h-4 w-4 rounded focus:ring-1 ${theme === 'dark' ? 'border-white/20 bg-transparent text-[#9bd5ff] focus:ring-[#9bd5ff]' : 'border-slate-300 text-slate-900 focus:ring-slate-900'}`}
          />
          <label htmlFor={consentId} className={`text-xs leading-5 ${theme === 'dark' ? 'text-white/60' : 'text-slate-700'}`}>
            <Link href="/on-bilgilendirme-formu" className={`font-medium underline underline-offset-2 ${theme === 'dark' ? 'text-white/90 hover:text-white' : 'text-slate-900'}`}>
              Pre-Information Form
            </Link>
            {", "}
            <Link href="/mesafeli-satis-sozlesmesi" className={`font-medium underline underline-offset-2 ${theme === 'dark' ? 'text-white/90 hover:text-white' : 'text-slate-900'}`}>
              Distance Sales Agreement
            </Link>
            {", "}
            <Link href="/kullanim-kosullari" className={`font-medium underline underline-offset-2 ${theme === 'dark' ? 'text-white/90 hover:text-white' : 'text-slate-900'}`}>
              Terms and Conditions
            </Link>
            {", "}
            <Link href="/gizlilik-politikasi" className={`font-medium underline underline-offset-2 ${theme === 'dark' ? 'text-white/90 hover:text-white' : 'text-slate-900'}`}>
              Privacy Policy
            </Link>
            {", "}
            <Link href="/cerez-politikasi" className={`font-medium underline underline-offset-2 ${theme === 'dark' ? 'text-white/90 hover:text-white' : 'text-slate-900'}`}>
              Cookie Policy
            </Link>
            {", and "}
            <Link href="/kvkk-aydinlatma-metni" className={`font-medium underline underline-offset-2 ${theme === 'dark' ? 'text-white/90 hover:text-white' : 'text-slate-900'}`}>
              GDPR Privacy Notice
            </Link>
            {". I have read, understood, and accept them."}
          </label>
        </div>
      </div>

      <Button onClick={handleClick} disabled={disabled || isLoading} className={className}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {label}
      </Button>
    </div>
  );
}

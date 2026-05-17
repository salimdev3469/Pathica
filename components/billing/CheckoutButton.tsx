'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CHECKOUT_CONSENT_DOCUMENTS } from '@/lib/legal-pages';

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

const LEGAL_WARNING_MESSAGE = 'Ödemeye devam etmek için gerekli sözleşme ve bilgilendirme metinlerini kabul etmelisiniz.';

export default function CheckoutButton({ packageCode, disabled = false, className, label = 'Buy Credits' }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const consentId = `checkout-consent-${packageCode}`;

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
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
        <div className="flex items-start gap-2.5">
          <input
            id={consentId}
            type="checkbox"
            checked={isConsentChecked}
            onChange={(event) => setIsConsentChecked(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          <label htmlFor={consentId} className="text-xs leading-5 text-slate-700">
            <Link href="/on-bilgilendirme-formu" className="font-medium text-slate-900 underline underline-offset-2">
              Ön Bilgilendirme Formu
            </Link>
            {"'nu, "}
            <Link href="/mesafeli-satis-sozlesmesi" className="font-medium text-slate-900 underline underline-offset-2">
              Mesafeli Satış Sözleşmesi
            </Link>
            {"'ni, "}
            <Link href="/kullanim-kosullari" className="font-medium text-slate-900 underline underline-offset-2">
              Kullanım Koşulları
            </Link>
            {"'nı, "}
            <Link href="/gizlilik-politikasi" className="font-medium text-slate-900 underline underline-offset-2">
              Gizlilik Politikası
            </Link>
            {"'nı, "}
            <Link href="/cerez-politikasi" className="font-medium text-slate-900 underline underline-offset-2">
              Çerez Politikası
            </Link>
            {"'nı ve "}
            <Link href="/kvkk-aydinlatma-metni" className="font-medium text-slate-900 underline underline-offset-2">
              KVKK Aydınlatma Metni
            </Link>
            {"'ni okudum, anladım ve kabul ediyorum."}
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

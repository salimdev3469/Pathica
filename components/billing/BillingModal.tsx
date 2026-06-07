'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CheckoutButton from '@/components/billing/CheckoutButton';

export type BillingPackageView = {
  code: string;
  name: string;
  credits: number;
  priceLabel: string;
  highlight?: boolean;
};

export default function BillingModal({
  open,
  onOpenChange,
  packages,
  creditCost,
  billingSchemaMissing,
  title = 'Unlock Feature',
  description = 'You need credits to perform this action.',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packages: BillingPackageView[];
  creditCost: number;
  billingSchemaMissing: boolean;
  title?: string;
  description?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[94vw] max-w-5xl overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-0 text-white shadow-2xl" data-lenis-prevent="true">
        <DialogHeader className="border-b border-white/10 p-7">
          <DialogTitle className="text-3xl font-black">{title}</DialogTitle>
          <DialogDescription className="text-white/60">
            {description} {creditCost} {'credits required.'}
          </DialogDescription>
        </DialogHeader>

        <div className="p-7">
          {billingSchemaMissing ? (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              Billing şeması henüz uygulanmamış. Satın alma için `supabase/schema.sql` dosyasını SQL Editor’da çalıştırın.
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.code}
                className={`rounded-2xl border p-5 ${
                  pkg.highlight
                    ? 'border-white/30 bg-white/10 shadow-xl'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-white">{pkg.name}</h3>
                    <p className="mt-1 text-sm text-white/50">{pkg.credits} credits</p>
                  </div>
                  <span className="text-lg font-black text-white">{pkg.priceLabel}</span>
                </div>
                <CheckoutButton
                  packageCode={pkg.code}
                  label={'Buy Credits'}
                  theme="dark"
                  className="w-full rounded-xl bg-white text-slate-950 hover:bg-white/90"
                />
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CheckoutButton from '@/components/billing/CheckoutButton';
import {
  ADVANCED_AI_CREDIT_COST,
  BILLING_PACKAGES,
  COVER_LETTER_CREDIT_COST,
  FREE_SIGNUP_AI_CREDITS,
  FREE_SIGNUP_EXPORTS,
  PDF_EXPORT_CREDIT_COST,
  formatUsd,
  getDodoProductId,
} from '@/lib/billing-config';
import { getBillingSummaryText, getUserBillingPayments, getWalletSnapshot } from '@/lib/billing';
import { createClient } from '@/lib/supabase-server';

function isBillingSchemaCacheError(error: unknown): boolean {
  const asRecord = error as { code?: string; message?: string } | null;
  if (!asRecord) return false;

  const code = String(asRecord.code || '');
  const message = String(asRecord.message || '');
  return code === 'PGRST205' || message.includes('dodo_payments') || message.includes('credit_wallets');
}

export default async function BillingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/billing');
  }

  let wallet = { creditBalance: 0, freeExportsRemaining: 0 };
  let payments: Awaited<ReturnType<typeof getUserBillingPayments>> = [];
  let billingSchemaMissing = false;

  try {
    const result = await Promise.all([getWalletSnapshot(user.id), getUserBillingPayments(user.id, 12)]);
    wallet = result[0];
    payments = result[1];
  } catch (error) {
    if (isBillingSchemaCacheError(error)) {
      billingSchemaMissing = true;
    } else {
      throw error;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{'Billing & Credits'}</h1>
            <p className="mt-2 text-sm text-slate-600">{getBillingSummaryText('en')}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">{'Back to Dashboard'}</Link>
          </Button>
        </div>

        {billingSchemaMissing ? (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Billing tablolari Supabase tarafinda henuz olusturulmamis. `supabase/schema.sql` dosyasini SQL Editorda calistirip
            sayfayi yenileyin.
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>{'Wallet'}</CardTitle>
              <CardDescription>{'Your current usage entitlements.'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>
                {'Credit balance'}: <strong>{wallet.creditBalance}</strong>
              </p>
              <p>
                {'Free exports remaining'}: <strong>{wallet.freeExportsRemaining}</strong>
              </p>
              <p>
                {'Signup bonus'}: <strong>{FREE_SIGNUP_AI_CREDITS}</strong> {'AI credits'} +{' '}
                <strong>{FREE_SIGNUP_EXPORTS}</strong> {'free PDF export'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>{'Usage Rules'}</CardTitle>
              <CardDescription>
                {'Build and preview remain free. Paid only for export + advanced AI.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>
                {'Tailor / Generate from Job cost'}:{' '}
                <strong>{ADVANCED_AI_CREDIT_COST}</strong> {'credits'}
              </p>
              <p>
                {'Cover Letter generation cost'}: <strong>{COVER_LETTER_CREDIT_COST}</strong>{' '}
                {'credits'}
              </p>
              <p>
                {'PDF export cost (after first free export)'}:{' '}
                <strong>{PDF_EXPORT_CREDIT_COST}</strong> {'credits'}
              </p>
              <p className="pt-1 text-xs text-slate-500">{getBillingSummaryText('en')}</p>
            </CardContent>
          </Card>
        </div>

        <section className="mt-8">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">{'Credit Packages'}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {BILLING_PACKAGES.map((pkg) => {
              const configured = Boolean(getDodoProductId(pkg));
              return (
                <Card
                  key={pkg.code}
                  className={`border ${pkg.highlight ? 'border-slate-900 shadow-sm' : 'border-slate-200'} bg-white`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{pkg.name}</span>
                      {pkg.highlight ? (
                        <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
                          {'Most Popular'}
                        </span>
                      ) : null}
                    </CardTitle>
                    <CardDescription>
                      {pkg.credits} {'credits'}
                    </CardDescription>
                    <p className="text-3xl font-bold text-slate-900">{formatUsd(pkg.priceUsd)}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CheckoutButton
                      packageCode={pkg.code}
                      disabled={!configured}
                      className="w-full"
                      label={configured ? 'Buy Credits' : 'Coming Soon'}
                    />
                    <p className="text-xs text-slate-500">{getBillingSummaryText('en')}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">{'Recent Payments'}</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-2">{'Date'}</th>
                  <th className="px-3 py-2">{'Package'}</th>
                  <th className="px-3 py-2">{'Credits'}</th>
                  <th className="px-3 py-2">{'Status'}</th>
                  <th className="px-3 py-2">{'Payment ID'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4" colSpan={5}>
                      {'No payment records yet.'}
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-3 py-2">{new Date(payment.created_at).toLocaleString()}</td>
                      <td className="px-3 py-2">{payment.package_code}</td>
                      <td className="px-3 py-2">{payment.credit_amount}</td>
                      <td className="px-3 py-2">{payment.status}</td>
                      <td className="px-3 py-2">{payment.dodo_payment_id || payment.dodo_session_id || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

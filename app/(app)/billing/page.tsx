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
  getShopierCheckoutUrl,
} from '@/lib/billing-config';
import { getBillingSummaryText, getUserBillingPayments, getWalletSnapshot } from '@/lib/billing';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';
import { createClient } from '@/lib/supabase-server';

function isBillingSchemaCacheError(error: unknown): boolean {
  const asRecord = error as { code?: string; message?: string } | null;
  if (!asRecord) return false;

  const code = String(asRecord.code || '');
  const message = String(asRecord.message || '');
  return code === 'PGRST205' || message.includes('shopier_payments') || message.includes('credit_wallets');
}

export default async function BillingPage() {
  const locale = normalizeLocale(cookies().get(LOCALE_COOKIE_NAME)?.value);
  const isTr = locale === 'tr';
  const t = (en: string, tr: string) => (isTr ? tr : en);

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
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t('Billing & Credits', 'Ödeme ve Krediler')}</h1>
            <p className="mt-2 text-sm text-slate-600">{getBillingSummaryText(locale)}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">{t('Back to Dashboard', 'Panele Dön')}</Link>
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
              <CardTitle>{t('Wallet', 'Cüzdan')}</CardTitle>
              <CardDescription>{t('Your current usage entitlements.', 'Mevcut kullanım hakların.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>
                {t('Credit balance', 'Kredi bakiyesi')}: <strong>{wallet.creditBalance}</strong>
              </p>
              <p>
                {t('Free exports remaining', 'Kalan ücretsiz export')}: <strong>{wallet.freeExportsRemaining}</strong>
              </p>
              <p>
                {t('Signup bonus', 'Kayıt bonusu')}: <strong>{FREE_SIGNUP_AI_CREDITS}</strong> {t('AI credits', 'AI kredi')} +{' '}
                <strong>{FREE_SIGNUP_EXPORTS}</strong> {t('free PDF export', 'ücretsiz PDF export')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>{t('Usage Rules', 'Kullanım Kuralları')}</CardTitle>
              <CardDescription>
                {t('Build and preview remain free. Paid only for export + advanced AI.', 'Build ve preview ücretsizdir. Ücret sadece export + gelişmiş AI içindir.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>
                {t('Tailor / Generate from Job cost', 'Tailor / Generate from Job maliyeti')}:{' '}
                <strong>{ADVANCED_AI_CREDIT_COST}</strong> {t('credits', 'kredi')}
              </p>
              <p>
                {t('Cover Letter generation cost', 'Cover Letter üretim maliyeti')}: <strong>{COVER_LETTER_CREDIT_COST}</strong>{' '}
                {t('credits', 'kredi')}
              </p>
              <p>
                {t('PDF export cost (after first free export)', 'PDF export maliyeti (ilk ücretsiz export sonrası)')}:{' '}
                <strong>{PDF_EXPORT_CREDIT_COST}</strong> {t('credits', 'kredi')}
              </p>
              <p className="pt-1 text-xs text-slate-500">{getBillingSummaryText(locale)}</p>
            </CardContent>
          </Card>
        </div>

        <section className="mt-8">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">{t('Credit Packages', 'Kredi Paketleri')}</h2>
          <p className="mb-3 text-xs text-slate-600">
            {t(
              `For automatic crediting, use this same email on Shopier checkout: ${user.email || '-'}`,
              `Otomatik kredi aktarimi icin Shopier odemesinde ayni e-postayi kullanin: ${user.email || '-'}`,
            )}
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {BILLING_PACKAGES.map((pkg) => {
              const configured = Boolean(getShopierCheckoutUrl(pkg));
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
                          {t('Most Popular', 'En Popüler')}
                        </span>
                      ) : null}
                    </CardTitle>
                    <CardDescription>
                      {pkg.credits} {t('credits', 'kredi')}
                    </CardDescription>
                    <p className="text-3xl font-bold text-slate-900">{formatUsd(pkg.priceUsd)}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CheckoutButton
                      packageCode={pkg.code}
                      disabled={!configured}
                      className="w-full"
                      label={configured ? t('Buy with Shopier', 'Shopier ile Satın Al') : t('Not Configured', 'Yapılandırılmadı')}
                    />
                    <p className="text-xs text-slate-500">{getBillingSummaryText(locale)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">{t('Recent Payments', 'Son Ödemeler')}</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-2">{t('Date', 'Tarih')}</th>
                  <th className="px-3 py-2">{t('Package', 'Paket')}</th>
                  <th className="px-3 py-2">{t('Credits', 'Kredi')}</th>
                  <th className="px-3 py-2">{t('Status', 'Durum')}</th>
                  <th className="px-3 py-2">{t('Order', 'Sipariş')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4" colSpan={5}>
                      {t('No payment records yet.', 'Henüz ödeme kaydı yok.')}
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-3 py-2">{new Date(payment.created_at).toLocaleString()}</td>
                      <td className="px-3 py-2">{payment.package_code}</td>
                      <td className="px-3 py-2">{payment.credit_amount}</td>
                      <td className="px-3 py-2">{payment.status}</td>
                      <td className="px-3 py-2">{payment.shopier_order_id || '-'}</td>
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

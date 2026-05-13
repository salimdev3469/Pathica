import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import BillingReturnStatus from '@/components/billing/BillingReturnStatus';
import { Button } from '@/components/ui/button';
import { getBillingSummaryText } from '@/lib/billing';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';
import { createClient } from '@/lib/supabase-server';

type BillingReturnPageProps = {
  searchParams: {
    payment_id?: string;
    order_id?: string;
  };
};

export default async function BillingReturnPage({ searchParams }: BillingReturnPageProps) {
  const locale = normalizeLocale(cookies().get(LOCALE_COOKIE_NAME)?.value);
  const t = (en: string, tr: string) => (locale === 'tr' ? tr : en);
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/billing/return');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t('Shopier Payment Return', 'Shopier Ödeme Sonucu')}</h1>
          <Button variant="outline" asChild>
            <Link href="/billing">{t('Back to Billing', 'Faturalamaya Dön')}</Link>
          </Button>
        </div>

        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          {getBillingSummaryText(locale)}
        </div>

        <BillingReturnStatus paymentId={searchParams.payment_id} orderId={searchParams.order_id} />
      </main>
    </div>
  );
}

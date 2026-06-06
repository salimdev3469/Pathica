import Link from 'next/link';
import BillingReturnStatus from '@/components/billing/BillingReturnStatus';
import { Button } from '@/components/ui/button';

type PaymentSuccessPageProps = {
  searchParams: {
    payment_id?: string;
    session_id?: string;
  };
};

export default function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Payment successful</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your credits will be activated shortly.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Payments are processed securely through Dodo Payments. If activation is delayed, this page will update automatically.
          </p>

          <div className="mt-6">
            <BillingReturnStatus paymentId={searchParams.payment_id} sessionId={searchParams.session_id} />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/billing">Back to billing</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

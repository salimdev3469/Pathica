import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Payment cancelled</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Payment was cancelled.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">You can try again anytime. No credits were added to your account.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/billing">Try again</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import AdminPaymentsTable from '@/components/billing/AdminPaymentsTable';
import { Button } from '@/components/ui/button';
import { getBillingSummaryText, isBillingAdminEmail, listAdminPayments } from '@/lib/billing';
import { createClient } from '@/lib/supabase-server';

export default async function AdminBillingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/admin/billing');
  }

  if (!isBillingAdminEmail(user.email)) {
    redirect('/dashboard');
  }

  const payments = await listAdminPayments();

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Billing Queue</h1>
            <p className="mt-2 text-sm text-slate-600">{getBillingSummaryText()}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Manual fallback mode: approve or reject unmatched Shopier payments when webhook matching cannot auto-map a user.
        </div>

        <AdminPaymentsTable initialPayments={payments} />
      </main>
    </div>
  );
}

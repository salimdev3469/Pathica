import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { isBillingAdminEmail, listAdminPayments } from '@/lib/billing';
import { createClient } from '@/lib/supabase-server';
import { listAllUsers, listLoginLogs, listSupportTickets } from '@/lib/admin';
import AdminDashboardTabs from '@/components/admin/AdminDashboardTabs';

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/admin');
  }

  if (!isBillingAdminEmail(user.email)) {
    redirect('/dashboard');
  }

  const usersPromise = listAllUsers();
  const loginLogsPromise = listLoginLogs();
  const paymentsPromise = listAdminPayments();
  const supportTicketsPromise = listSupportTickets();

  const [users, loginLogs, payments, supportTickets] = await Promise.all([
    usersPromise,
    loginLogsPromise,
    paymentsPromise,
    supportTicketsPromise,
  ]);

  // Sort users by created_at descending
  users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Panel</h1>
            <p className="mt-2 text-sm text-slate-600">Manage users, billing, and support.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" asChild>
               <Link href="/dashboard">Back to Dashboard</Link>
             </Button>
          </div>
        </div>

        <AdminDashboardTabs
          users={users}
          loginLogs={loginLogs}
          payments={payments}
          supportTickets={supportTickets}
        />
      </main>
    </div>
  );
}

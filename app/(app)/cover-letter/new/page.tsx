import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import CoverLetterBuilder from './CoverLetterBuilder';
import { getWalletSnapshot } from '@/lib/billing';
import { BILLING_PACKAGES } from '@/lib/billing-config';
import DashboardShell from '@/components/dashboard/DashboardShell';

function isBillingSchemaCacheError(error: unknown): boolean {
  const asRecord = error as { code?: string; message?: string } | null;
  if (!asRecord) return false;

  const code = String(asRecord.code || '');
  const message = String(asRecord.message || '');
  return code === 'PGRST205' || message.includes('billing_payments') || message.includes('credit_wallets');
}

export default async function NewCoverLetterPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: cvs } = await supabase
        .from('cvs')
        .select('id,title')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

    let wallet = { creditBalance: 0, freeExportsRemaining: 0 };
    let billingSchemaMissing = false;

    try {
        wallet = await getWalletSnapshot(user.id);
    } catch (error) {
        if (isBillingSchemaCacheError(error)) {
            billingSchemaMissing = true;
        } else {
            throw error;
        }
    }

    const billingPackages = BILLING_PACKAGES.map((pkg) => ({
        code: pkg.id,
        name: pkg.name,
        credits: pkg.credits,
        priceLabel: pkg.displayPrice,
        highlight: pkg.isPopular,
    }));

    return (
        <DashboardShell
            active="coverLetters"
            userEmail={user.email}
            userName={user.user_metadata?.full_name}
            wallet={wallet}
            billingSchemaMissing={billingSchemaMissing}
        >
            <CoverLetterBuilder
                cvs={cvs || []}
                userName={user.user_metadata?.full_name || user.email?.split('@')[0] || ''}
                billingPackages={billingPackages}
                billingSchemaMissing={billingSchemaMissing}
            />
        </DashboardShell>
    );
}

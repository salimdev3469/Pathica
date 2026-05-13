import { NextResponse } from 'next/server';
import {
  ADVANCED_AI_CREDIT_COST,
  BILLING_PACKAGES,
  FREE_SIGNUP_AI_CREDITS,
  FREE_SIGNUP_EXPORTS,
  PDF_EXPORT_CREDIT_COST,
  getShopierCheckoutUrl,
} from '@/lib/billing-config';
import { getBillingSummaryText, getUserBillingPayments, getUserLedger, getWalletSnapshot } from '@/lib/billing';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [wallet, payments, ledger] = await Promise.all([
      getWalletSnapshot(user.id),
      getUserBillingPayments(user.id, 20),
      getUserLedger(user.id, 20),
    ]);

    return NextResponse.json({
      wallet,
      payments,
      ledger,
      packages: BILLING_PACKAGES.map((pkg) => ({
        code: pkg.code,
        name: pkg.name,
        credits: pkg.credits,
        priceUsd: pkg.priceUsd,
        highlight: Boolean(pkg.highlight),
        checkoutConfigured: Boolean(getShopierCheckoutUrl(pkg)),
      })),
      rules: {
        freeSignupAiCredits: FREE_SIGNUP_AI_CREDITS,
        freeSignupExports: FREE_SIGNUP_EXPORTS,
        advancedAiCreditCost: ADVANCED_AI_CREDIT_COST,
        pdfExportCreditCost: PDF_EXPORT_CREDIT_COST,
      },
      summaryText: getBillingSummaryText(),
    });
  } catch (error) {
    console.error('Failed to fetch wallet data:', error);
    return NextResponse.json({ error: 'Failed to fetch billing data' }, { status: 500 });
  }
}

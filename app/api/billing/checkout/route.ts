import { NextResponse } from 'next/server';
import { createPendingShopierPayment, getWalletSnapshot } from '@/lib/billing';
import { getBillingPackageByCode, getShopierCheckoutUrl } from '@/lib/billing-config';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

type CheckoutRequest = {
  packageCode?: string;
  legalAccepted?: boolean;
  legalAcceptedAt?: string;
  legalAcceptedDocuments?: string[];
};

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.email) {
      return NextResponse.json({ error: 'A verified account email is required for checkout.' }, { status: 400 });
    }

    const body = (await req.json().catch(() => null)) as CheckoutRequest | null;
    const packageCode = String(body?.packageCode || '').trim().toLowerCase();
    const pkg = getBillingPackageByCode(packageCode);
    const legalAccepted = Boolean(body?.legalAccepted);

    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    if (!legalAccepted) {
      return NextResponse.json(
        { error: 'Ödemeye devam etmek için gerekli sözleşme ve bilgilendirme metinlerini kabul etmelisiniz.' },
        { status: 400 },
      );
    }

    const checkoutUrl = getShopierCheckoutUrl(pkg);
    if (!checkoutUrl) {
      return NextResponse.json({ error: 'Payment link is not configured for this package.' }, { status: 503 });
    }

    const legalAcceptedAtInput = String(body?.legalAcceptedAt || '').trim();
    const parsedAcceptedAt = legalAcceptedAtInput ? Date.parse(legalAcceptedAtInput) : NaN;
    const legalAcceptedAt = Number.isNaN(parsedAcceptedAt)
      ? new Date().toISOString()
      : new Date(parsedAcceptedAt).toISOString();

    const legalAcceptedDocuments = Array.isArray(body?.legalAcceptedDocuments)
      ? body.legalAcceptedDocuments
        .map((item) => String(item || '').trim())
        .filter(Boolean)
      : [];

    const legalAcceptance = {
      accepted: true as const,
      acceptedAt: legalAcceptedAt,
      documents: legalAcceptedDocuments,
      packageCode: pkg.code,
      packagePriceUsd: pkg.priceUsd,
      source: 'billing_checkout',
    };

    console.info('Checkout legal consent captured', {
      userId: user.id,
      packageCode: pkg.code,
      packagePriceUsd: pkg.priceUsd,
      legalAcceptedAt,
      acceptedDocuments: legalAcceptedDocuments,
    });

    const payment = await createPendingShopierPayment({
      userId: user.id,
      buyerEmail: user.email,
      pkg,
      checkoutUrl,
      legalAcceptance,
    });

    const wallet = await getWalletSnapshot(user.id);

    return NextResponse.json({
      payment: {
        id: payment.id,
        packageCode: payment.package_code,
        credits: payment.credit_amount,
        priceUsd: Number(payment.package_price_usd),
        status: payment.status,
        createdAt: payment.created_at,
      },
      checkoutUrl,
      statusUrl: `/billing/return?payment_id=${encodeURIComponent(payment.id)}`,
      wallet,
    });
  } catch (error) {
    const asRecord = error as { code?: string; message?: string } | null;
    if (asRecord?.code === 'PGRST205') {
      return NextResponse.json(
        { error: 'Billing schema is not initialized. Apply supabase/schema.sql first.' },
        { status: 503 },
      );
    }

    console.error('Failed to initialize Shopier checkout:', error);
    return NextResponse.json({ error: 'Failed to start checkout' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createDodoCheckoutSession } from '@/lib/dodo';
import { createPendingDodoPayment, getWalletSnapshot } from '@/lib/billing';
import { getBillingPackageByCode, getDodoProductId } from '@/lib/billing-config';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

type CheckoutRequest = {
  packageCode?: string;
  legalAccepted?: boolean;
  legalAcceptedAt?: string;
  legalAcceptedDocuments?: string[];
};

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

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

    const dodoProductId = getDodoProductId(pkg);
    if (!dodoProductId) {
      return NextResponse.json({ error: 'Payment is not configured for this package.' }, { status: 503 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Get user display name from metadata if available
    const userName = String(
      user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || ''
    ).trim();

    const internalId = uuidv4();

    const { sessionId, checkoutUrl } = await createDodoCheckoutSession({
      productId: dodoProductId,
      quantity: 1,
      customerEmail: user.email,
      customerName: userName || undefined,
      returnUrl: `${appUrl}/payment/success?internal_id=${internalId}`,
      metadata: {
        userId: user.id,
        email: user.email,
        internalPlanId: pkg.code,
        billingType: 'one_time',
        credits: String(pkg.credits),
      },
    });

    const legalAcceptedAtInput = String(body?.legalAcceptedAt || '').trim();
    const parsedAcceptedAt = legalAcceptedAtInput ? Date.parse(legalAcceptedAtInput) : NaN;
    const legalAcceptedAt = Number.isNaN(parsedAcceptedAt)
      ? new Date().toISOString()
      : new Date(parsedAcceptedAt).toISOString();

    const legalAcceptedDocuments = Array.isArray(body?.legalAcceptedDocuments)
      ? body.legalAcceptedDocuments.map((item) => String(item || '').trim()).filter(Boolean)
      : [];

    const payment = await createPendingDodoPayment({
      id: internalId,
      userId: user.id,
      buyerEmail: user.email,
      pkg,
      sessionId,
      checkoutUrl,
      metadata: {
        legalAccepted: true,
        legalAcceptedAt,
        legalAcceptedDocuments,
      },
    });

    const wallet = await getWalletSnapshot(user.id);

    return NextResponse.json({
      payment: {
        id: payment.id,
        packageCode: payment.package_code,
        credits: payment.credit_amount,
        status: payment.status,
        createdAt: payment.created_at,
      },
      checkoutUrl,
      sessionId,
      wallet,
    });
  } catch (error) {
    console.error('Failed to initialize Dodo checkout:', error);
    return NextResponse.json({ error: 'Failed to start checkout' }, { status: 500 });
  }
}

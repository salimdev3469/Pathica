import { NextRequest, NextResponse } from 'next/server';
import {
  getBillingPaymentById,
  getWalletSnapshot,
  grantCreditsForPayment,
  isBillingAdminEmail,
  markPaymentManualApproved,
  resolveUserIdForBillingEmail,
} from '@/lib/billing';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

type ApprovePayload = {
  userId?: string;
  dodoPaymentId?: string;
};

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isBillingAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const paymentId = String(params.id || '').trim();
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment id is required' }, { status: 400 });
    }

    const existing = await getBillingPaymentById(paymentId);
    if (!existing) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (existing.status !== 'credited') {
      const payload = (await req.json().catch(() => ({}))) as ApprovePayload;
      let resolvedUserId = payload.userId || existing.user_id || undefined;

      if (!resolvedUserId && existing.buyer_email) {
        resolvedUserId = (await resolveUserIdForBillingEmail(existing.buyer_email)) || undefined;
      }

      await markPaymentManualApproved({
        paymentId,
        adminEmail: user.email || '',
        userId: resolvedUserId,
        dodoPaymentId: payload.dodoPaymentId,
      });

      const grantResult = await grantCreditsForPayment(paymentId, 'admin_manual_approval');
      if (!grantResult.success) {
        return NextResponse.json(
          {
            error: 'Payment approved but could not be credited automatically. Map a valid user and retry.',
            code: grantResult.code,
          },
          { status: 409 },
        );
      }
    }

    const refreshed = await getBillingPaymentById(paymentId);
    if (!refreshed) {
      return NextResponse.json({ error: 'Payment not found after approval' }, { status: 404 });
    }

    const wallet = refreshed.user_id ? await getWalletSnapshot(refreshed.user_id) : null;

    return NextResponse.json({ payment: refreshed, wallet });
  } catch (error) {
    console.error('Failed to approve payment:', error);
    return NextResponse.json({ error: 'Failed to approve payment' }, { status: 500 });
  }
}

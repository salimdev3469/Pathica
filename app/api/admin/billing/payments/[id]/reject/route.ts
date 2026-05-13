import { NextRequest, NextResponse } from 'next/server';
import { getBillingPaymentById, isBillingAdminEmail, markPaymentRejected } from '@/lib/billing';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

type RejectPayload = {
  reason?: string;
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

    if (existing.status === 'credited') {
      return NextResponse.json({ error: 'Credited payments cannot be rejected' }, { status: 409 });
    }

    const payload = (await req.json().catch(() => ({}))) as RejectPayload;

    await markPaymentRejected({
      paymentId,
      adminEmail: user.email || '',
      reason: payload.reason,
    });

    const refreshed = await getBillingPaymentById(paymentId);
    return NextResponse.json({ payment: refreshed });
  } catch (error) {
    console.error('Failed to reject payment:', error);
    return NextResponse.json({ error: 'Failed to reject payment' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import {
  type DodoPayment,
  findDodoPaymentBySessionId,
  getWalletSnapshot,
  grantCreditsForDodoPayment,
} from '@/lib/billing';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

function paymentResponse(payment: DodoPayment) {
  if (!payment) return null;
  return {
    id: payment.id,
    status: payment.status,
    packageCode: payment.package_code,
    credits: payment.credit_amount,
    priceUsd: Number(payment.package_price),
    buyerEmail: payment.buyer_email,
    dodoSessionId: payment.dodo_session_id,
    dodoPaymentId: payment.dodo_payment_id,
    createdAt: payment.created_at,
    paidAt: payment.paid_at,
    creditedAt: payment.credited_at,
    failureReason: payment.failure_reason,
  };
}

async function ensureGrantedIfPaid(paymentId: string) {
  let creditedNow = false;
  
  // Try to grant credits if the payment is in 'paid' status
  const granted = await grantCreditsForDodoPayment(paymentId, 'dodo_return_page_credit_grant');
  creditedNow = granted.success && (granted.code === 'OK' || granted.code === 'ALREADY_CREDITED');

  const supabase = createClient();
  const { data: refreshed } = await supabase.from('dodo_payments').select('*').eq('id', paymentId).single();
  const wallet = refreshed?.user_id ? await getWalletSnapshot(refreshed.user_id) : null;

  return {
    payment: refreshed as DodoPayment | null,
    creditedNow,
    wallet,
  };
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paymentId = String(req.nextUrl.searchParams.get('payment_id') || '').trim();
    const sessionId = String(req.nextUrl.searchParams.get('session_id') || '').trim();
    const internalId = String(req.nextUrl.searchParams.get('internal_id') || '').trim();

    if (!paymentId && !sessionId && !internalId) {
      return NextResponse.json({ error: 'payment_id, session_id or internal_id is required' }, { status: 400 });
    }

    let currentPayment: DodoPayment | null = null;
    
    if (internalId) {
      const { data } = await supabase.from('dodo_payments').select('*').eq('id', internalId).eq('user_id', user.id).maybeSingle();
      if (data) currentPayment = data as DodoPayment;
    } else if (paymentId) {
      const { data } = await supabase.from('dodo_payments').select('*').eq('id', paymentId).eq('user_id', user.id).maybeSingle();
      if (data) currentPayment = data as DodoPayment;
    } else if (sessionId) {
      currentPayment = await findDodoPaymentBySessionId(sessionId);
      if (currentPayment && currentPayment.user_id !== user.id) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    if (!currentPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (currentPayment.status === 'credited') {
       return NextResponse.json({
          source: 'already_settled',
          payment: paymentResponse(currentPayment),
          creditedNow: false,
          wallet: await getWalletSnapshot(user.id),
        });
    }

    // Try to ensure it's granted if it somehow got marked paid by webhook but not credited
    const grantResult = await ensureGrantedIfPaid(currentPayment.id);
    const updatedPayment = grantResult.payment || currentPayment;

    if (updatedPayment.status === 'pending') {
       // Just polling
       return NextResponse.json({
          source: 'payment_pending',
          payment: paymentResponse(updatedPayment),
          creditedNow: false,
          wallet: grantResult.wallet,
          status: 'processing',
          message: 'Payment is pending. Waiting for Dodo Payments confirmation...',
        });
    }

    return NextResponse.json({
      source: 'payment_processed',
      payment: paymentResponse(updatedPayment),
      creditedNow: grantResult.creditedNow,
      wallet: grantResult.wallet,
    });
  } catch (error) {
    console.error('Billing return flow failed:', error);
    return NextResponse.json({ error: 'Failed to process billing return' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import {
  type BillingPayment,
  createReviewPaymentFromWebhook,
  findPaymentByShopierOrderId,
  getBillingPaymentById,
  getBillingPaymentForUser,
  getWalletSnapshot,
  grantCreditsForPayment,
  listPendingPaymentsByEmailAndPackage,
  markPaymentPaid,
  normalizeEmail,
} from '@/lib/billing';
import { PENDING_MATCH_WINDOW_MINUTES, RETURN_RECONCILE_WINDOW_MINUTES, getBillingPackageByProductId } from '@/lib/billing-config';
import {
  extractShopierOrderPayload,
  fetchRecentShopierOrders,
  fetchShopierOrder,
  resolveOrderCreatedAt,
  resolveOrderEmail,
  resolveOrderId,
  resolveOrderPaymentStatus,
  resolveOrderProductIds,
  type ShopierOrderPayload,
} from '@/lib/shopier';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

function paymentResponse(payment: Awaited<ReturnType<typeof getBillingPaymentById>>) {
  if (!payment) return null;
  return {
    id: payment.id,
    status: payment.status,
    packageCode: payment.package_code,
    credits: payment.credit_amount,
    priceUsd: Number(payment.package_price_usd),
    buyerEmail: payment.buyer_email,
    shopierOrderId: payment.shopier_order_id,
    createdAt: payment.created_at,
    paidAt: payment.paid_at,
    creditedAt: payment.credited_at,
    failureReason: payment.failure_reason,
  };
}

async function ensureGrantedIfPaid(paymentId: string) {
  const payment = await getBillingPaymentById(paymentId);
  if (!payment) {
    return { payment: null, creditedNow: false, wallet: null as Awaited<ReturnType<typeof getWalletSnapshot>> | null };
  }

  let creditedNow = false;
  if (payment.status === 'paid') {
    const granted = await grantCreditsForPayment(payment.id, 'shopier_return_page_credit_grant');
    creditedNow = granted.success && (granted.code === 'OK' || granted.code === 'ALREADY_CREDITED');
  }

  const refreshed = await getBillingPaymentById(payment.id);
  const wallet = refreshed?.user_id ? await getWalletSnapshot(refreshed.user_id) : null;

  return {
    payment: refreshed,
    creditedNow,
    wallet,
  };
}

function isWithinMinutes(left: Date | null, right: Date | null, windowMinutes: number): boolean {
  if (!left || !right) return false;
  return Math.abs(left.getTime() - right.getTime()) <= windowMinutes * 60 * 1000;
}

function parsePaymentCreatedAt(payment: BillingPayment): Date | null {
  const parsed = new Date(payment.created_at);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

function resolveOrderMetadata(order: ShopierOrderPayload, fallbackOrderId: string) {
  const resolvedOrderId = resolveOrderId(order) || fallbackOrderId;
  const buyerEmailNormalized = normalizeEmail(resolveOrderEmail(order));
  const productIds = resolveOrderProductIds(order);
  const matchedPackage = productIds.map((id) => getBillingPackageByProductId(id)).find(Boolean) || null;
  const paymentStatus = resolveOrderPaymentStatus(order);
  const createdAt = resolveOrderCreatedAt(order);

  return {
    resolvedOrderId,
    buyerEmailNormalized,
    productIds,
    matchedPackage,
    paymentStatus,
    createdAt,
  };
}

function pickPendingCandidate(candidates: BillingPayment[], orderCreatedAt: Date | null): BillingPayment | null {
  if (candidates.length === 0) {
    return null;
  }

  const inWindow = candidates.filter((payment) =>
    isWithinMinutes(parsePaymentCreatedAt(payment), orderCreatedAt, PENDING_MATCH_WINDOW_MINUTES),
  );

  const pool = inWindow.length > 0 ? inWindow : candidates;
  if (pool.length !== 1) {
    return null;
  }

  return pool[0];
}

async function attemptOwnedPaymentReconcile(params: {
  ownedPayment: BillingPayment;
  userEmail: string;
  order: ShopierOrderPayload;
  fallbackOrderId: string;
}) {
  const { ownedPayment, userEmail, order, fallbackOrderId } = params;
  const meta = resolveOrderMetadata(order, fallbackOrderId);

  if (!meta.matchedPackage || meta.productIds.length === 0) {
    return { ok: false, reason: 'Order package could not be resolved.' };
  }

  if (meta.matchedPackage.code !== ownedPayment.package_code) {
    return { ok: false, reason: 'Order package does not match selected payment package.' };
  }

  if (meta.paymentStatus && !['paid', 'completed'].includes(meta.paymentStatus)) {
    return { ok: false, reason: `Order is not paid yet (status: ${meta.paymentStatus}).` };
  }

  const createdAtMatches = isWithinMinutes(
    parsePaymentCreatedAt(ownedPayment),
    meta.createdAt,
    RETURN_RECONCILE_WINDOW_MINUTES,
  );
  if (!createdAtMatches) {
    return { ok: false, reason: 'Order timestamp is outside the allowed reconciliation window.' };
  }

  const failureReason =
    userEmail && meta.buyerEmailNormalized && userEmail !== meta.buyerEmailNormalized
      ? `email_mismatch_shopier:${meta.buyerEmailNormalized}`
      : null;

  await markPaymentPaid({
    paymentId: ownedPayment.id,
    shopierOrderId: meta.resolvedOrderId,
    shopierProductId: meta.productIds[0] || '',
    failureReason,
  });

  return { ok: true, orderId: meta.resolvedOrderId };
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
    const orderIdParam = String(req.nextUrl.searchParams.get('order_id') || '').trim();
    const userEmail = normalizeEmail(user.email || '');

    if (!paymentId && !orderIdParam) {
      return NextResponse.json({ error: 'payment_id or order_id is required' }, { status: 400 });
    }

    let ownedPayment: BillingPayment | null = null;
    if (paymentId) {
      const payment = await getBillingPaymentForUser(paymentId, user.id);
      if (!payment) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }
      ownedPayment = payment;
    }

    if (orderIdParam) {
      if (ownedPayment && ownedPayment.status !== 'pending') {
        const settled = await ensureGrantedIfPaid(ownedPayment.id);
        return NextResponse.json({
          source: 'payment_id_already_settled',
          payment: paymentResponse(settled.payment),
          creditedNow: settled.creditedNow,
          wallet: settled.wallet,
        });
      }

      const existingByOrder = await findPaymentByShopierOrderId(orderIdParam);
      if (existingByOrder) {
        if (existingByOrder.user_id && existingByOrder.user_id !== user.id) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const grantResult = await ensureGrantedIfPaid(existingByOrder.id);
        return NextResponse.json({
          source: 'order_id_existing',
          payment: paymentResponse(grantResult.payment),
          creditedNow: grantResult.creditedNow,
          wallet: grantResult.wallet,
        });
      }

      const fetchedOrder = await fetchShopierOrder(orderIdParam);
      const orderPayload = extractShopierOrderPayload(fetchedOrder);

      if (!orderPayload) {
        return NextResponse.json({
          source: 'order_id_lookup',
          status: 'processing',
          message: 'Order is not available yet. Please try again shortly.',
        });
      }

      const meta = resolveOrderMetadata(orderPayload, orderIdParam);
      if (!meta.matchedPackage || meta.productIds.length === 0) {
        return NextResponse.json({
          source: 'order_id_lookup',
          status: 'review_required',
          message: 'Payment requires manual review. Could not resolve product/package.',
        });
      }

      if (meta.paymentStatus && !['paid', 'completed'].includes(meta.paymentStatus)) {
        return NextResponse.json({
          source: 'order_id_lookup',
          status: 'processing',
          message: `Order is not paid yet (status: ${meta.paymentStatus}).`,
        });
      }

      if (ownedPayment) {
        const reconcile = await attemptOwnedPaymentReconcile({
          ownedPayment,
          userEmail,
          order: orderPayload,
          fallbackOrderId: orderIdParam,
        });

        if (!reconcile.ok) {
          const refreshed = await ensureGrantedIfPaid(ownedPayment.id);
          return NextResponse.json({
            source: 'payment_id_order_id_review',
            payment: paymentResponse(refreshed.payment),
            creditedNow: refreshed.creditedNow,
            wallet: refreshed.wallet,
            status: 'review_required',
            message: reconcile.reason || 'Payment requires manual review.',
          });
        }

        const granted = await ensureGrantedIfPaid(ownedPayment.id);
        return NextResponse.json({
          source: 'payment_id_order_id_reconciled',
          payment: paymentResponse(granted.payment),
          creditedNow: granted.creditedNow,
          wallet: granted.wallet,
        });
      }

      if (!meta.buyerEmailNormalized || (userEmail && meta.buyerEmailNormalized !== userEmail)) {
        return NextResponse.json({
          source: 'order_id_lookup',
          status: 'review_required',
          message: 'Buyer email does not match your account. Payment requires manual review.',
        });
      }

      const pendingCandidates = await listPendingPaymentsByEmailAndPackage({
        buyerEmail: meta.buyerEmailNormalized,
        packageCode: meta.matchedPackage.code,
        limit: 5,
      });
      const pendingPayment = pickPendingCandidate(pendingCandidates, meta.createdAt);

      if (pendingPayment) {
        if (pendingPayment.user_id && pendingPayment.user_id !== user.id) {
          return NextResponse.json({
            source: 'order_id_lookup',
            status: 'review_required',
            message: 'Payment belongs to a different account and requires manual review.',
          });
        }

        await markPaymentPaid({
          paymentId: pendingPayment.id,
          shopierOrderId: meta.resolvedOrderId,
          shopierProductId: meta.productIds[0] || '',
        });

        const grantResult = await ensureGrantedIfPaid(pendingPayment.id);
        return NextResponse.json({
          source: 'order_id_lookup_pending',
          payment: paymentResponse(grantResult.payment),
          creditedNow: grantResult.creditedNow,
          wallet: grantResult.wallet,
        });
      }

      const reviewPayment = await createReviewPaymentFromWebhook({
        userId: user.id,
        buyerEmail: meta.buyerEmailNormalized,
        packageCode: meta.matchedPackage.code,
        packagePriceUsd: meta.matchedPackage.priceUsd,
        credits: meta.matchedPackage.credits,
        shopierOrderId: meta.resolvedOrderId,
        shopierProductId: meta.productIds[0] || '',
        failureReason: 'manual_review_required_pending_payment_not_found',
      });

      return NextResponse.json({
        source: 'order_id_lookup_created_review',
        payment: paymentResponse(reviewPayment),
        creditedNow: false,
        wallet: await getWalletSnapshot(user.id),
        message: 'Payment has been queued for manual review.',
      });
    }

    if (!ownedPayment) {
      return NextResponse.json({
        source: 'status_only',
        status: 'processing',
        message: 'Payment is pending. Please provide an order_id or wait for webhook processing.',
      });
    }

    const grantResult = await ensureGrantedIfPaid(ownedPayment.id);
    const currentPayment = grantResult.payment;
    if (!currentPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (currentPayment.status !== 'pending') {
      return NextResponse.json({
        source: 'payment_id',
        payment: paymentResponse(currentPayment),
        creditedNow: grantResult.creditedNow,
        wallet: grantResult.wallet,
        summary: 'No subscription. One-time purchase. USD fixed pricing.',
      });
    }

    const recentOrders = await fetchRecentShopierOrders(25);
    const candidates = await Promise.all(
      recentOrders.map(async (order) => {
        const meta = resolveOrderMetadata(order, '');
        if (!meta.resolvedOrderId || !meta.matchedPackage || meta.productIds.length === 0) return null;
        if (meta.matchedPackage.code !== currentPayment.package_code) return null;
        if (meta.paymentStatus && !['paid', 'completed'].includes(meta.paymentStatus)) return null;
        if (!isWithinMinutes(parsePaymentCreatedAt(currentPayment), meta.createdAt, RETURN_RECONCILE_WINDOW_MINUTES)) return null;

        const existingByOrder = await findPaymentByShopierOrderId(meta.resolvedOrderId);
        if (existingByOrder && existingByOrder.id !== currentPayment.id) return null;

        return {
          order,
          meta,
        };
      }),
    );

    const eligible = candidates.filter(Boolean) as Array<{ order: ShopierOrderPayload; meta: ReturnType<typeof resolveOrderMetadata> }>;
    if (eligible.length === 1) {
      const reconcile = await attemptOwnedPaymentReconcile({
        ownedPayment: currentPayment,
        userEmail,
        order: eligible[0].order,
        fallbackOrderId: eligible[0].meta.resolvedOrderId,
      });

      if (reconcile.ok) {
        const refreshed = await ensureGrantedIfPaid(currentPayment.id);
        return NextResponse.json({
          source: 'payment_id_auto_reconciled',
          payment: paymentResponse(refreshed.payment),
          creditedNow: refreshed.creditedNow,
          wallet: refreshed.wallet,
        });
      }
    }

    return NextResponse.json({
      source: 'payment_id_pending',
      payment: paymentResponse(currentPayment),
      creditedNow: false,
      wallet: grantResult.wallet,
      status: 'processing',
      message:
        eligible.length > 1
          ? 'Multiple candidate orders found. Add order_id on /billing/return for precise reconciliation.'
          : 'Payment is pending. Wait for webhook or retry with order_id on /billing/return.',
    });
  } catch (error) {
    console.error('Billing return flow failed:', error);
    return NextResponse.json({ error: 'Failed to process billing return' }, { status: 500 });
  }
}

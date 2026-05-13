import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  createReviewPaymentFromWebhook,
  findPaymentByShopierOrderId,
  grantCreditsForPayment,
  listPendingPaymentsByPackage,
  listPendingPaymentsByEmailAndPackage,
  markPaymentPaid,
  markWebhookEventProcessed,
  resolveUserIdForBillingEmail,
  upsertWebhookEvent,
} from '@/lib/billing';
import { PENDING_MATCH_WINDOW_MINUTES, getBillingPackageByProductId } from '@/lib/billing-config';
import {
  extractShopierOrderPayload,
  fetchShopierOrder,
  resolveOrderCreatedAt,
  resolveOrderEmail,
  resolveOrderId,
  resolveOrderProductIds,
  verifyShopierWebhookSignature,
} from '@/lib/shopier';

export const dynamic = 'force-dynamic';

function normalizeEvent(eventHeader: string | null): string {
  const normalized = String(eventHeader || '').trim();
  return normalized || 'unknown';
}

function resolveWebhookTokensFromEnv(): string[] {
  return String(process.env.SHOPIER_WEBHOOK_TOKEN || '')
    .split(',')
    .map((token) =>
      token
        .trim()
        .replace(/^['"](.*)['"]$/s, '$1')
        .trim(),
    )
    .filter(Boolean);
}

function selectPendingPaymentCandidate(
  candidates: Array<{ id: string; created_at: string; user_id: string | null }>,
  orderCreatedAt: Date | null,
) {
  if (candidates.length === 0) {
    return { candidate: null as (typeof candidates)[number] | null, reason: 'manual_review_required_no_pending_match' };
  }

  const reference = orderCreatedAt || new Date();
  const windowMs = PENDING_MATCH_WINDOW_MINUTES * 60 * 1000;
  const inWindow = candidates.filter((payment) => {
    const createdAt = new Date(payment.created_at);
    if (Number.isNaN(createdAt.getTime())) return false;
    return Math.abs(createdAt.getTime() - reference.getTime()) <= windowMs;
  });

  const pool = inWindow.length > 0 ? inWindow : candidates;
  if (pool.length !== 1) {
    return {
      candidate: null as (typeof candidates)[number] | null,
      reason: `manual_review_required_ambiguous_pending_matches_${pool.length}`,
    };
  }

  return { candidate: pool[0], reason: null as string | null };
}

function buildTrackedWebhookId(webhookId: string, eventName: string, rawBody: string): string {
  if (webhookId) {
    return webhookId;
  }

  const digest = crypto.createHash('sha256').update(`${eventName}:${rawBody}`).digest('hex').slice(0, 24);
  return `missing-id:${eventName}:${digest}`;
}

function parsePayload(rawBody: string): unknown {
  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    return {
      parse_error: 'invalid_json',
      raw_body_preview: rawBody.slice(0, 5000),
    };
  }
}

export async function POST(req: Request) {
  const webhookId = String(req.headers.get('Shopier-Webhook-Id') || req.headers.get('shopier-webhook-id') || '').trim();
  const eventName = normalizeEvent(req.headers.get('Shopier-Event') || req.headers.get('shopier-event'));
  let trackedWebhookId: string | null = null;

  try {
    const rawBody = await req.text();
    const payload = parsePayload(rawBody);
    trackedWebhookId = buildTrackedWebhookId(webhookId, eventName, rawBody);
    const insertedEvent = await upsertWebhookEvent({
      webhookId: trackedWebhookId,
      event: eventName,
      payload,
    });

    // A webhook retry with the same webhook id should not trigger duplicate processing.
    if (!insertedEvent && webhookId) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const signature = req.headers.get('Shopier-Signature') || req.headers.get('shopier-signature');
    const webhookSecrets = resolveWebhookTokensFromEnv();

    const isValid = verifyShopierWebhookSignature(rawBody, signature, webhookSecrets);
    if (!isValid) {
      await markWebhookEventProcessed(trackedWebhookId, 'failed', 'INVALID_SIGNATURE');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    if (!eventName.startsWith('order.')) {
      await markWebhookEventProcessed(trackedWebhookId, 'ignored');
      return NextResponse.json({ received: true, ignored: true });
    }

    const incomingOrder = extractShopierOrderPayload(payload);
    const incomingOrderId = resolveOrderId(incomingOrder || {});
    const orderFromApi = incomingOrderId ? await fetchShopierOrder(incomingOrderId) : null;
    const canonicalOrder = extractShopierOrderPayload(orderFromApi) || incomingOrder;

    if (!canonicalOrder) {
      await markWebhookEventProcessed(trackedWebhookId, 'failed', 'ORDER_PAYLOAD_NOT_RESOLVED');
      return NextResponse.json({ received: true, ignored: true });
    }

    const orderId = resolveOrderId(canonicalOrder);
    const buyerEmail = resolveOrderEmail(canonicalOrder);
    const mappedUserIdFromEmail = buyerEmail ? await resolveUserIdForBillingEmail(buyerEmail) : null;
    const productIds = resolveOrderProductIds(canonicalOrder);
    const orderCreatedAt = resolveOrderCreatedAt(canonicalOrder);

    if (!orderId) {
      await markWebhookEventProcessed(trackedWebhookId, 'failed', 'ORDER_ID_MISSING');
      return NextResponse.json({ received: true, ignored: true });
    }

    const matchedPackage = productIds.map((id) => getBillingPackageByProductId(id)).find(Boolean) || null;
    if (!matchedPackage) {
      await markWebhookEventProcessed(trackedWebhookId, 'failed', 'PRODUCT_OR_EMAIL_UNRESOLVED');
      return NextResponse.json({ received: true, ignored: true });
    }

    const existingOrderPayment = await findPaymentByShopierOrderId(orderId);
    if (existingOrderPayment) {
      if (existingOrderPayment.status === 'rejected' || existingOrderPayment.status === 'failed') {
        await markWebhookEventProcessed(trackedWebhookId, 'processed');
        return NextResponse.json({ received: true, paymentId: existingOrderPayment.id, ignored: true });
      }

      const existingPaymentUserId = existingOrderPayment.user_id || mappedUserIdFromEmail || null;
      if (!existingPaymentUserId) {
        await markWebhookEventProcessed(trackedWebhookId, 'processed');
        return NextResponse.json({ received: true, paymentId: existingOrderPayment.id, manualReview: true });
      }

      if (existingOrderPayment.status !== 'credited') {
        await markPaymentPaid({
          paymentId: existingOrderPayment.id,
          shopierOrderId: orderId,
          shopierProductId: productIds[0] || '',
          userId: existingPaymentUserId,
        });

        const grant = await grantCreditsForPayment(existingOrderPayment.id, 'shopier_webhook_credit_grant');
        if (!grant.success && grant.code === 'USER_NOT_MAPPED') {
          await markWebhookEventProcessed(trackedWebhookId, 'processed');
          return NextResponse.json({ received: true, paymentId: existingOrderPayment.id, manualReview: true });
        }
      }

      await markWebhookEventProcessed(trackedWebhookId, 'processed');
      return NextResponse.json({ received: true, paymentId: existingOrderPayment.id });
    }

    const pendingCandidates =
      buyerEmail.length > 0
        ? await listPendingPaymentsByEmailAndPackage({
            buyerEmail,
            packageCode: matchedPackage.code,
            limit: 5,
          })
        : [];

    const fallbackPendingCandidates =
      pendingCandidates.length > 0
        ? pendingCandidates
        : await listPendingPaymentsByPackage({
            packageCode: matchedPackage.code,
            limit: 10,
          });
    const pendingSelection = selectPendingPaymentCandidate(fallbackPendingCandidates, orderCreatedAt);
    const pendingPayment = pendingSelection.candidate;

    if (pendingPayment) {
      const pendingPaymentUserId = pendingPayment.user_id || mappedUserIdFromEmail || null;
      if (!pendingPaymentUserId) {
        await markWebhookEventProcessed(trackedWebhookId, 'processed');
        return NextResponse.json({ received: true, paymentId: pendingPayment.id, manualReview: true });
      }

      await markPaymentPaid({
        paymentId: pendingPayment.id,
        shopierOrderId: orderId,
        shopierProductId: productIds[0] || '',
        userId: pendingPaymentUserId,
      });

      const grant = await grantCreditsForPayment(pendingPayment.id, 'shopier_webhook_credit_grant');
      if (!grant.success && grant.code === 'USER_NOT_MAPPED') {
        await markWebhookEventProcessed(trackedWebhookId, 'processed');
        return NextResponse.json({ received: true, paymentId: pendingPayment.id, manualReview: true });
      }

      await markWebhookEventProcessed(trackedWebhookId, 'processed');

      return NextResponse.json({ received: true, paymentId: pendingPayment.id });
    }

    try {
      const reviewPayment = await createReviewPaymentFromWebhook({
        userId: mappedUserIdFromEmail || undefined,
        buyerEmail,
        packageCode: matchedPackage.code,
        packagePriceUsd: matchedPackage.priceUsd,
        credits: matchedPackage.credits,
        shopierOrderId: orderId,
        shopierProductId: productIds[0] || '',
        failureReason: pendingSelection.reason || 'manual_review_required_no_pending_match',
      });

      await markWebhookEventProcessed(trackedWebhookId, 'processed');
      return NextResponse.json({ received: true, reviewPaymentId: reviewPayment.id });
    } catch (createReviewError) {
      // If a duplicate webhook races on the same order, resolve by reading existing payment.
      const racedPayment = await findPaymentByShopierOrderId(orderId);
      if (racedPayment) {
        if (racedPayment.status === 'paid' && racedPayment.user_id) {
          await grantCreditsForPayment(racedPayment.id, 'shopier_webhook_credit_grant');
        }

        await markWebhookEventProcessed(trackedWebhookId, 'processed');
        return NextResponse.json({ received: true, paymentId: racedPayment.id });
      }

      throw createReviewError;
    }
  } catch (error) {
    console.error('Shopier webhook processing failed:', error);

    if (trackedWebhookId) {
      try {
        await markWebhookEventProcessed(trackedWebhookId, 'failed', error instanceof Error ? error.message : 'UNKNOWN_ERROR');
      } catch (markError) {
        console.error('Failed to mark webhook event as failed:', markError);
      }
    }

    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

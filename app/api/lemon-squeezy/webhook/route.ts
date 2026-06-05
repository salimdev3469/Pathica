import { NextResponse } from 'next/server';
import {
  findPaymentByProviderOrderId,
  getBillingPaymentById,
  grantCreditsForPayment,
  markPaymentPaid,
  markWebhookEventProcessed,
  upsertWebhookEvent,
} from '@/lib/billing';
import { getBillingPackageById, getBillingPackageByVariantId } from '@/lib/billing-config';
import {
  resolveLemonCustomerId,
  resolveLemonCustomData,
  resolveLemonOrderId,
  resolveLemonVariantId,
  resolveLemonWebhookEventId,
  resolveLemonWebhookEventName,
  type LemonWebhookPayload,
  verifyLemonSqueezyWebhookSignature,
} from '@/lib/lemon-squeezy';

export const dynamic = 'force-dynamic';

const STORED_ONLY_EVENTS = new Set(['subscription_created', 'subscription_updated', 'subscription_cancelled']);

export async function POST(req: Request) {
  let eventId: string | null = null;

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('X-Signature') || req.headers.get('x-signature');

    if (!verifyLemonSqueezyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as LemonWebhookPayload;
    const eventName = resolveLemonWebhookEventName(payload, req.headers.get('X-Event-Name') || req.headers.get('x-event-name'));
    eventId = resolveLemonWebhookEventId(payload, rawBody);

    const insertedEvent = await upsertWebhookEvent({
      provider: 'lemon_squeezy',
      eventId,
      event: eventName,
      payload,
    });

    if (!insertedEvent) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (STORED_ONLY_EVENTS.has(eventName)) {
      await markWebhookEventProcessed(eventId, 'ignored');
      return NextResponse.json({ received: true, ignored: true });
    }

    if (eventName !== 'order_created') {
      await markWebhookEventProcessed(eventId, 'ignored');
      return NextResponse.json({ received: true, ignored: true });
    }

    const customData = resolveLemonCustomData(payload);
    const paymentId = customData.payment_id || '';
    const planId = customData.plan_id || '';
    const orderId = resolveLemonOrderId(payload);
    const variantId = resolveLemonVariantId(payload);
    const customerId = resolveLemonCustomerId(payload);

    if (!orderId) {
      await markWebhookEventProcessed(eventId, 'failed', 'ORDER_ID_MISSING');
      return NextResponse.json({ received: true, ignored: true });
    }

    const existingByOrder = await findPaymentByProviderOrderId(orderId);
    if (existingByOrder) {
      if (existingByOrder.status === 'paid' || existingByOrder.status === 'credited') {
        const grant = await grantCreditsForPayment(existingByOrder.id, 'lemon_squeezy_webhook_credit_grant');
        await markWebhookEventProcessed(eventId, grant.success ? 'processed' : 'failed', grant.success ? undefined : grant.code);
        return NextResponse.json({ received: true, paymentId: existingByOrder.id, credited: grant.success });
      }
    }

    if (!paymentId) {
      await markWebhookEventProcessed(eventId, 'failed', 'PAYMENT_ID_MISSING');
      return NextResponse.json({ received: true, ignored: true });
    }

    const payment = await getBillingPaymentById(paymentId);
    if (!payment) {
      await markWebhookEventProcessed(eventId, 'failed', 'PAYMENT_NOT_FOUND');
      return NextResponse.json({ received: true, ignored: true });
    }

    const configuredPackage = getBillingPackageById(planId || payment.package_id);
    const packageByVariant = getBillingPackageByVariantId(variantId || payment.provider_variant_id);
    const expectedVariantId = configuredPackage?.variantId || payment.provider_variant_id || '';

    if (expectedVariantId && variantId && expectedVariantId !== variantId) {
      await markWebhookEventProcessed(eventId, 'failed', 'VARIANT_MISMATCH');
      return NextResponse.json({ received: true, ignored: true });
    }

    if (packageByVariant && packageByVariant.id !== payment.package_id) {
      await markWebhookEventProcessed(eventId, 'failed', 'PACKAGE_MISMATCH');
      return NextResponse.json({ received: true, ignored: true });
    }

    await markPaymentPaid({
      paymentId: payment.id,
      providerOrderId: orderId,
      providerVariantId: variantId || payment.provider_variant_id,
      providerCustomerId: customerId || payment.provider_customer_id,
    });

    const grant = await grantCreditsForPayment(payment.id, 'lemon_squeezy_webhook_credit_grant');
    await markWebhookEventProcessed(eventId, grant.success ? 'processed' : 'failed', grant.success ? undefined : grant.code);

    return NextResponse.json({ received: true, paymentId: payment.id, credited: grant.success });
  } catch (error) {
    console.error('Lemon Squeezy webhook processing failed:', error);

    if (eventId) {
      try {
        await markWebhookEventProcessed(eventId, 'failed', error instanceof Error ? error.message : 'UNKNOWN_ERROR');
      } catch (markError) {
        console.error('Failed to mark Lemon Squeezy webhook event as failed:', markError);
      }
    }

    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

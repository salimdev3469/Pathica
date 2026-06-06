import { NextResponse } from 'next/server';
import { verifyDodoWebhookSignature, type DodoWebhookPayload } from '@/lib/dodo';
import {
  grantCreditsForDodoPayment,
  markDodoPaymentPaid,
  markDodoPaymentFailed,
  markDodoPaymentRefunded,
  upsertDodoWebhookEvent,
  markDodoWebhookEventProcessed,
  findDodoPaymentByProviderPaymentId,
  findDodoPaymentBySessionId,
} from '@/lib/billing';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const webhookId = req.headers.get('webhook-id') || '';
  let trackedEventId: string | null = null;

  try {
    const rawBody = await req.text();

    // 1. Verify webhook signature
    let payload: DodoWebhookPayload;
    try {
      payload = verifyDodoWebhookSignature(rawBody, {
        webhookId: req.headers.get('webhook-id') || '',
        webhookSignature: req.headers.get('webhook-signature') || '',
        webhookTimestamp: req.headers.get('webhook-timestamp') || '',
      }) as DodoWebhookPayload;
    } catch (verifyError) {
      console.error('Dodo webhook signature verification failed:', verifyError);
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    if (!payload || !payload.event_type) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // 2. Idempotency check
    trackedEventId = webhookId || `generated:${Date.now()}`;
    const insertedEvent = await upsertDodoWebhookEvent({
      webhookId: trackedEventId,
      eventType: payload.event_type,
      payload: payload,
    });

    if (!insertedEvent && webhookId) {
      // Duplicate webhook - already processed
      return NextResponse.json({ received: true, duplicate: true });
    }

    // 3. Event routing
    const eventType = payload.event_type;
    const data = payload.data || {};

    switch (eventType) {
      case 'payment.succeeded': {
        const paymentId = String(data.payment_id || '');
        if (!paymentId) {
          await markDodoWebhookEventProcessed(trackedEventId, 'failed', 'PAYMENT_ID_MISSING');
          break;
        }

        // Mark payment as paid
        await markDodoPaymentPaid({
          providerPaymentId: paymentId,
          providerCustomerId: String(data.customer_id || '') || undefined,
          amount: data.amount ? Number(data.amount) : undefined,
          currency: data.currency ? String(data.currency) : undefined,
        });

        // Grant credits
        const payment = await findDodoPaymentByProviderPaymentId(paymentId);
        if (payment) {
          await grantCreditsForDodoPayment(payment.id, 'dodo_webhook_credit_grant');
        }

        await markDodoWebhookEventProcessed(trackedEventId, 'processed');
        break;
      }

      case 'payment.failed':
      case 'payment.cancelled': {
        const paymentId = String(data.payment_id || '');
        if (paymentId) {
          await markDodoPaymentFailed(paymentId, eventType);
        }
        await markDodoWebhookEventProcessed(trackedEventId, 'processed');
        break;
      }

      case 'refund.succeeded': {
        const paymentId = String(data.payment_id || '');
        if (paymentId) {
          await markDodoPaymentRefunded(paymentId);
        }
        await markDodoWebhookEventProcessed(trackedEventId, 'processed');
        break;
      }

      case 'dispute.opened':
      case 'dispute.lost': {
        const paymentId = String(data.payment_id || '');
        if (paymentId) {
          await markDodoPaymentFailed(paymentId, eventType);
        }
        await markDodoWebhookEventProcessed(trackedEventId, 'processed');
        break;
      }

      default: {
        // Unhandled event — log and ignore
        console.info(`Unhandled Dodo webhook event: ${eventType}`);
        await markDodoWebhookEventProcessed(trackedEventId, 'ignored');
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Dodo webhook processing failed:', error);

    if (trackedEventId) {
      try {
        await markDodoWebhookEventProcessed(
          trackedEventId,
          'failed',
          error instanceof Error ? error.message : 'UNKNOWN_ERROR',
        );
      } catch (markError) {
        console.error('Failed to mark webhook event as failed:', markError);
      }
    }

    // Always return 200 to prevent Dodo from retrying
    return NextResponse.json({ received: true, error: 'Processing failed' });
  }
}

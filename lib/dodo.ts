import DodoPayments from 'dodopayments';
import { Webhook } from 'standardwebhooks';

let _client: DodoPayments | null = null;

export function getDodoClient(): DodoPayments {
  if (!_client) {
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    if (!apiKey) {
      throw new Error('DODO_PAYMENTS_API_KEY is not configured.');
    }
    _client = new DodoPayments({
      bearerToken: apiKey,
      environment: process.env.DODO_PAYMENTS_ENV === 'live' ? 'live_mode' : 'test_mode',
    });
  }
  return _client;
}

export type DodoCheckoutParams = {
  productId: string;
  quantity?: number;
  customerEmail: string;
  customerName?: string;
  returnUrl: string;
  metadata?: Record<string, string>;
};

export type DodoCheckoutResult = {
  sessionId: string;
  checkoutUrl: string;
};

export async function createDodoCheckoutSession(params: DodoCheckoutParams): Promise<DodoCheckoutResult> {
  const client = getDodoClient();

  const session = await client.checkoutSessions.create({
    product_cart: [{ product_id: params.productId, quantity: params.quantity || 1 }],
    customer: {
      email: params.customerEmail,
      name: params.customerName || undefined,
    },
    return_url: params.returnUrl,
    metadata: params.metadata || {},
  });

  // The SDK returns various fields - extract what we need
  const sessionId = (session as any).session_id || (session as any).id || '';
  const checkoutUrl = (session as any).checkout_url || (session as any).url || '';

  if (!checkoutUrl) {
    throw new Error('Dodo Payments did not return a checkout URL.');
  }

  return { sessionId: String(sessionId), checkoutUrl: String(checkoutUrl) };
}

export function verifyDodoWebhookSignature(
  rawBody: string,
  headers: { webhookId: string; webhookSignature: string; webhookTimestamp: string },
): unknown {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('DODO_PAYMENTS_WEBHOOK_SECRET is not configured.');
  }

  const wh = new Webhook(secret);
  return wh.verify(rawBody, {
    'webhook-id': headers.webhookId,
    'webhook-signature': headers.webhookSignature,
    'webhook-timestamp': headers.webhookTimestamp,
  });
}

export type DodoWebhookPayload = {
  event_type: string;
  timestamp?: string;
  data: {
    payment_id?: string;
    subscription_id?: string;
    customer_id?: string;
    amount?: number;
    currency?: string;
    status?: string;
    metadata?: Record<string, string>;
    [key: string]: unknown;
  };
};

import crypto from 'node:crypto';
import type { BillingPackage } from '@/lib/billing-config';

export class LemonSqueezyConfigError extends Error {
  constructor(message = 'Checkout link is not configured yet.') {
    super(message);
    this.name = 'LemonSqueezyConfigError';
  }
}

export class LemonSqueezyApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'LemonSqueezyApiError';
    this.status = status;
  }
}

export type LemonCheckoutResult = {
  checkoutId: string;
  checkoutUrl: string;
};

export type LemonWebhookPayload = {
  meta?: {
    event_name?: string;
    custom_data?: Record<string, unknown>;
    webhook_id?: string;
  };
  data?: {
    id?: string | number;
    type?: string;
    attributes?: Record<string, unknown>;
  };
};

export function resolveAppBaseUrl(): string {
  const raw = String(process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || '').trim();
  const fallback = 'http://localhost:3000';
  const value = raw || fallback;
  return value.replace(/\/+$/, '');
}

export function isLemonSqueezyCheckoutConfigured(pkg: BillingPackage): boolean {
  return Boolean(
    String(process.env.LEMON_SQUEEZY_API_KEY || '').trim() &&
      String(process.env.LEMON_SQUEEZY_STORE_ID || '').trim() &&
      String(pkg.variantId || '').trim(),
  );
}

export async function createLemonSqueezyCheckout(input: {
  pkg: BillingPackage;
  paymentId: string;
  userId: string;
  email: string;
}): Promise<LemonCheckoutResult> {
  const apiKey = String(process.env.LEMON_SQUEEZY_API_KEY || '').trim();
  const storeId = String(process.env.LEMON_SQUEEZY_STORE_ID || '').trim();
  const variantId = String(input.pkg.variantId || '').trim();

  if (!apiKey || !storeId || !variantId) {
    throw new LemonSqueezyConfigError();
  }

  const appUrl = resolveAppBaseUrl();
  const payload = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: {
          email: input.email,
          custom: {
            user_id: input.userId,
            payment_id: input.paymentId,
            plan_id: input.pkg.id,
          },
        },
        checkout_options: {
          embed: false,
        },
        product_options: {
          name: `${input.pkg.name} Credits`,
          description: input.pkg.description,
          redirect_url: `${appUrl}/payment/success?payment_id=${encodeURIComponent(input.paymentId)}`,
          receipt_button_text: 'Go to dashboard',
          receipt_link_url: `${appUrl}/dashboard`,
        },
      },
      relationships: {
        store: {
          data: {
            type: 'stores',
            id: storeId,
          },
        },
        variant: {
          data: {
            type: 'variants',
            id: variantId,
          },
        },
      },
    },
  };

  const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const data = (await response.json().catch(() => null)) as {
    data?: {
      id?: string | number;
      attributes?: {
        url?: string;
      };
    };
    errors?: Array<{ detail?: string; title?: string }>;
  } | null;

  if (!response.ok) {
    const detail = data?.errors?.map((item) => item.detail || item.title).filter(Boolean).join(' ') || 'Lemon Squeezy checkout failed.';
    throw new LemonSqueezyApiError(detail, response.status);
  }

  const checkoutId = String(data?.data?.id || '').trim();
  const checkoutUrl = String(data?.data?.attributes?.url || '').trim();
  if (!checkoutId || !checkoutUrl) {
    throw new LemonSqueezyApiError('Lemon Squeezy checkout response did not include a URL.', 502);
  }

  return { checkoutId, checkoutUrl };
}

export function verifyLemonSqueezyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = String(process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || '').trim();
  const signature = String(signatureHeader || '').trim();
  if (!secret || !signature) {
    return false;
  }

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return safeEqual(expected, signature);
}

export function resolveLemonWebhookEventName(payload: LemonWebhookPayload, headerEventName?: string | null): string {
  return String(headerEventName || payload.meta?.event_name || '').trim() || 'unknown';
}

export function resolveLemonWebhookEventId(payload: LemonWebhookPayload, rawBody: string): string {
  const explicit = String(payload.meta?.webhook_id || '').trim();
  if (explicit) {
    return explicit;
  }

  const eventName = resolveLemonWebhookEventName(payload);
  const resourceId = String(payload.data?.id || '').trim();
  if (eventName && resourceId) {
    return `${eventName}:${resourceId}`;
  }

  return `lemon:${crypto.createHash('sha256').update(rawBody).digest('hex').slice(0, 32)}`;
}

export function resolveLemonCustomData(payload: LemonWebhookPayload): Record<string, string> {
  const raw = payload.meta?.custom_data || {};
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    const normalized = String(value || '').trim();
    if (normalized) {
      result[key] = normalized;
    }
  }
  return result;
}

export function resolveLemonOrderId(payload: LemonWebhookPayload): string {
  return String(payload.data?.id || '').trim();
}

export function resolveLemonVariantId(payload: LemonWebhookPayload): string {
  const attributes = payload.data?.attributes || {};
  const firstOrderItem = attributes.first_order_item as Record<string, unknown> | undefined;
  return String(
    attributes.variant_id ||
      attributes.variantId ||
      firstOrderItem?.variant_id ||
      firstOrderItem?.variantId ||
      '',
  ).trim();
}

export function resolveLemonCustomerId(payload: LemonWebhookPayload): string {
  const attributes = payload.data?.attributes || {};
  return String(attributes.customer_id || attributes.customerId || '').trim();
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

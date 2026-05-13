import crypto from 'node:crypto';

export type ShopierLineItem = {
  productId?: string;
  product_id?: string;
  id?: string;
  product?: {
    id?: string;
  };
  title?: string;
};

export type ShopierOrderPayload = {
  id?: string;
  orderId?: string;
  order_id?: string;
  dateCreated?: string;
  date_created?: string;
  paymentStatus?: string;
  payment_status?: string;
  status?: string;
  email?: string;
  buyer?: {
    email?: string;
  };
  shippingInfo?: {
    email?: string;
  };
  shipping_info?: {
    email?: string;
  };
  billingInfo?: {
    email?: string;
  };
  billing_info?: {
    email?: string;
  };
  note?: string;
  lineItems?: ShopierLineItem[];
  line_items?: ShopierLineItem[];
  items?: ShopierLineItem[];
};

export function normalizeEmail(email: string | null | undefined): string {
  return String(email || '').trim().toLowerCase();
}

export function resolveOrderEmail(order: ShopierOrderPayload): string {
  return normalizeEmail(
    order.shippingInfo?.email ||
      order.shipping_info?.email ||
      order.billingInfo?.email ||
      order.billing_info?.email ||
      order.buyer?.email ||
      order.email ||
      '',
  );
}

export function resolveOrderProductIds(order: ShopierOrderPayload): string[] {
  const ids = new Set<string>();
  const lineItems = [...(order.lineItems || []), ...(order.line_items || []), ...(order.items || [])];
  for (const lineItem of lineItems) {
    const id = String(lineItem?.productId || lineItem?.product_id || lineItem?.id || lineItem?.product?.id || '').trim();
    if (id) {
      ids.add(id);
    }
  }
  return Array.from(ids);
}

export function resolveOrderId(order: ShopierOrderPayload): string {
  return String(order.id || order.orderId || order.order_id || '').trim();
}

export function resolveOrderCreatedAt(order: ShopierOrderPayload): Date | null {
  const value = String(order.dateCreated || order.date_created || '').trim();
  if (!value) {
    return null;
  }

  const asDate = new Date(value);
  if (Number.isNaN(asDate.getTime())) {
    return null;
  }

  return asDate;
}

export function resolveOrderPaymentStatus(order: ShopierOrderPayload): string {
  return String(order.paymentStatus || order.payment_status || '').trim().toLowerCase();
}

export function extractShopierOrderPayload(payload: unknown): ShopierOrderPayload | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const asAny = payload as Record<string, unknown>;
  const candidates = [asAny, asAny.order as Record<string, unknown>, asAny.data as Record<string, unknown>];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue;

    const maybeOrder = candidate as ShopierOrderPayload;
    const hasId = resolveOrderId(maybeOrder).length > 0;
    const hasProducts = resolveOrderProductIds(maybeOrder).length > 0;
    const hasEmail = resolveOrderEmail(maybeOrder).length > 0;

    if (hasId || hasProducts || hasEmail) {
      return maybeOrder;
    }
  }

  return null;
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

export function verifyShopierWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secretOrSecrets: string | string[] | null,
): boolean {
  if (!signatureHeader || !secretOrSecrets) {
    return false;
  }

  const signature = signatureHeader.trim().replace(/^sha256=/i, '');
  const secrets = Array.isArray(secretOrSecrets) ? secretOrSecrets : [secretOrSecrets];

  for (const secret of secrets) {
    const normalized = String(secret || '').trim();
    if (!normalized) continue;

    const hmacHex = crypto.createHmac('sha256', normalized).update(rawBody).digest('hex');
    const hmacBase64 = crypto.createHmac('sha256', normalized).update(rawBody).digest('base64');

    if (safeEqual(signature, hmacHex) || safeEqual(signature, hmacBase64)) {
      return true;
    }
  }

  return false;
}

export async function fetchShopierOrder(orderId: string): Promise<ShopierOrderPayload | null> {
  const token = process.env.SHOPIER_PAT;
  if (!token) {
    return null;
  }

  const sanitizedId = String(orderId || '').trim();
  if (!sanitizedId) {
    return null;
  }

  const response = await fetch(`https://api.shopier.com/v1/orders/${encodeURIComponent(sanitizedId)}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json().catch(() => null)) as ShopierOrderPayload | null;
  if (!data || typeof data !== 'object') {
    return null;
  }

  return data;
}

export async function fetchRecentShopierOrders(limit = 20): Promise<ShopierOrderPayload[]> {
  const token = process.env.SHOPIER_PAT;
  if (!token) {
    return [];
  }

  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(100, Math.floor(limit))) : 20;
  const response = await fetch(`https://api.shopier.com/v1/orders?limit=${safeLimit}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json().catch(() => [])) as unknown;
  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter((item): item is ShopierOrderPayload => Boolean(item) && typeof item === 'object');
}

export type ShopierWebhookEvent =
  | 'order.addressUpdated'
  | 'order.created'
  | 'order.fulfilled'
  | 'product.created'
  | 'product.updated'
  | 'refund.requested'
  | 'refund.updated';

export type ShopierWebhookSubscription = {
  id: string;
  event: ShopierWebhookEvent;
  url: string;
  token?: string;
};

export class ShopierApiRequestError extends Error {
  status: number | null;
  code: string;

  constructor(code: string, message: string, status: number | null = null) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function readShopierPat(): string {
  const value = String(process.env.SHOPIER_PAT || '').trim();
  if (!value) {
    throw new ShopierApiRequestError('SHOPIER_PAT_MISSING', 'SHOPIER_PAT is not configured.');
  }

  return value;
}

function normalizeAbsoluteUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

export function resolveShopierAppBaseUrl(): string {
  const candidate =
    String(process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || process.env.PUBLIC_APP_URL || '').trim() ||
    'https://www.pathica.tech';

  if (!/^https?:\/\//i.test(candidate)) {
    throw new ShopierApiRequestError('APP_URL_INVALID', 'Application URL must start with http:// or https://');
  }

  return normalizeAbsoluteUrl(candidate);
}

export function resolveShopierWebhookNotificationUrl(): string {
  return `${resolveShopierAppBaseUrl()}/api/shopier/webhook`;
}

function pickWebhookSubscriptionCandidate(raw: unknown): ShopierWebhookSubscription | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const asAny = raw as Record<string, unknown>;
  const id = String(asAny.id || '').trim();
  const event = String(asAny.event || '').trim() as ShopierWebhookEvent;
  const url = String(asAny.url || '').trim();
  const token = String(asAny.token || '').trim();

  if (!id || !event || !url) {
    return null;
  }

  return token ? { id, event, url, token } : { id, event, url };
}

function parseWebhookSubscriptions(raw: unknown): ShopierWebhookSubscription[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => pickWebhookSubscriptionCandidate(item)).filter(Boolean) as ShopierWebhookSubscription[];
  }

  if (raw && typeof raw === 'object') {
    const asAny = raw as Record<string, unknown>;
    const single = pickWebhookSubscriptionCandidate(asAny);
    if (single) {
      return [single];
    }

    for (const key of ['data', 'items', 'results', 'webhooks']) {
      const nested = asAny[key];
      if (Array.isArray(nested)) {
        return nested
          .map((item) => pickWebhookSubscriptionCandidate(item))
          .filter(Boolean) as ShopierWebhookSubscription[];
      }
    }
  }

  return [];
}

async function requestShopier(path: string, init?: RequestInit): Promise<unknown> {
  const token = readShopierPat();
  const response = await fetch(`https://api.shopier.com/v1${path}`, {
    method: init?.method || 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...(init?.headers || {}),
    },
    body: init?.body,
    cache: 'no-store',
  });

  const body = await response.json().catch(() => null);
  if (response.ok) {
    return body;
  }

  const message =
    String((body as Record<string, unknown> | null)?.message || '') ||
    String((body as Record<string, unknown> | null)?.error || '') ||
    `Shopier API request failed with status ${response.status}.`;

  if (response.status === 401 && /revoked/i.test(message)) {
    throw new ShopierApiRequestError('SHOPIER_PAT_REVOKED', message, response.status);
  }

  if (response.status === 401) {
    throw new ShopierApiRequestError('SHOPIER_UNAUTHORIZED', message, response.status);
  }

  throw new ShopierApiRequestError('SHOPIER_API_ERROR', message, response.status);
}

export async function listShopierWebhookSubscriptions(): Promise<ShopierWebhookSubscription[]> {
  const raw = await requestShopier('/webhooks?limit=50');
  return parseWebhookSubscriptions(raw);
}

export async function createShopierWebhookSubscription(
  event: ShopierWebhookEvent,
  url: string,
): Promise<ShopierWebhookSubscription> {
  const raw = await requestShopier('/webhooks', {
    method: 'POST',
    body: JSON.stringify({ event, url }),
  });

  const parsed = parseWebhookSubscriptions(raw);
  if (parsed.length === 0) {
    throw new ShopierApiRequestError(
      'SHOPIER_WEBHOOK_PARSE_ERROR',
      'Shopier webhook create response could not be parsed.',
      null,
    );
  }

  return parsed[0];
}

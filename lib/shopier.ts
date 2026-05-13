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

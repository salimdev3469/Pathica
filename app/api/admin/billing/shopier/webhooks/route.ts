import { NextResponse } from 'next/server';
import { isBillingAdminEmail } from '@/lib/billing';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/lib/supabase-server';
import {
  ShopierApiRequestError,
  createShopierWebhookSubscription,
  deleteShopierWebhookSubscription,
  listShopierWebhookSubscriptions,
  resolveShopierWebhookNotificationUrl,
  type ShopierWebhookEvent,
  type ShopierWebhookSubscription,
} from '@/lib/shopier';

export const dynamic = 'force-dynamic';

const REQUIRED_EVENTS: ShopierWebhookEvent[] = ['order.created'];

type WebhookHealth = {
  expectedUrl: string | null;
  requiredEvents: ShopierWebhookEvent[];
  patConfigured: boolean;
  patStatus: 'ok' | 'missing' | 'error';
  patCode: string | null;
  patMessage: string | null;
  envWebhookTokenCount: number;
  subscriptions: Array<{ id: string; event: string; url: string }>;
  coverage: Array<{
    event: ShopierWebhookEvent;
    matched: boolean;
    matchingSubscriptionIds: string[];
    conflictingSubscriptionIds: string[];
  }>;
  recentEvents: Array<{
    webhookId: string;
    event: string;
    status: string;
    errorMessage: string | null;
    receivedAt: string | null;
    processedAt: string | null;
  }>;
};

function normalizeUrl(value: string | null | undefined): string {
  return String(value || '').trim().replace(/\/+$/, '');
}

function parseEnvWebhookTokens(): string[] {
  return String(process.env.SHOPIER_WEBHOOK_TOKEN || '')
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);
}

function listCoverage(expectedUrl: string, subscriptions: ShopierWebhookSubscription[]) {
  const normalizedExpectedUrl = normalizeUrl(expectedUrl);
  return REQUIRED_EVENTS.map((event) => {
    const eventSubscriptions = subscriptions.filter((item) => item.event === event);
    const matching = eventSubscriptions.filter((item) => normalizeUrl(item.url) === normalizedExpectedUrl);
    const conflicting = eventSubscriptions.filter((item) => normalizeUrl(item.url) !== normalizedExpectedUrl);

    return {
      event,
      matched: matching.length > 0,
      matchingSubscriptionIds: matching.map((item) => item.id),
      conflictingSubscriptionIds: conflicting.map((item) => item.id),
    };
  });
}

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  if (!isBillingAdminEmail(user.email)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { user };
}

async function recentWebhookEvents() {
  const { data, error } = await supabaseAdmin
    .from('shopier_webhook_events')
    .select('webhook_id,event,status,error_message,received_at,processed_at')
    .order('received_at', { ascending: false })
    .limit(20);

  if (error) {
    return [];
  }

  return (data || []).map((row) => ({
    webhookId: String(row.webhook_id || ''),
    event: String(row.event || ''),
    status: String(row.status || ''),
    errorMessage: row.error_message ? String(row.error_message) : null,
    receivedAt: row.received_at ? String(row.received_at) : null,
    processedAt: row.processed_at ? String(row.processed_at) : null,
  }));
}

async function buildWebhookHealth(): Promise<WebhookHealth> {
  const tokens = parseEnvWebhookTokens();
  const patConfigured = Boolean(String(process.env.SHOPIER_PAT || '').trim());
  let expectedUrl: string | null = null;

  try {
    expectedUrl = resolveShopierWebhookNotificationUrl();
  } catch {
    expectedUrl = null;
  }

  if (!patConfigured) {
    return {
      expectedUrl,
      requiredEvents: REQUIRED_EVENTS,
      patConfigured: false,
      patStatus: 'missing',
      patCode: 'SHOPIER_PAT_MISSING',
      patMessage: 'SHOPIER_PAT is not configured.',
      envWebhookTokenCount: tokens.length,
      subscriptions: [],
      coverage: [],
      recentEvents: await recentWebhookEvents(),
    };
  }

  try {
    const subscriptions = await listShopierWebhookSubscriptions();
    const simplified = subscriptions.map((item) => ({ id: item.id, event: item.event, url: item.url }));

    return {
      expectedUrl,
      requiredEvents: REQUIRED_EVENTS,
      patConfigured: true,
      patStatus: 'ok',
      patCode: null,
      patMessage: null,
      envWebhookTokenCount: tokens.length,
      subscriptions: simplified,
      coverage: expectedUrl ? listCoverage(expectedUrl, subscriptions) : [],
      recentEvents: await recentWebhookEvents(),
    };
  } catch (error) {
    const shopierError = error as ShopierApiRequestError | null;
    return {
      expectedUrl,
      requiredEvents: REQUIRED_EVENTS,
      patConfigured: true,
      patStatus: 'error',
      patCode: shopierError?.code || 'SHOPIER_API_ERROR',
      patMessage: shopierError?.message || 'Failed to access Shopier API.',
      envWebhookTokenCount: tokens.length,
      subscriptions: [],
      coverage: [],
      recentEvents: await recentWebhookEvents(),
    };
  }
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }

  const health = await buildWebhookHealth();
  return NextResponse.json(health);
}

export async function POST() {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }

  let expectedUrl: string;
  try {
    expectedUrl = resolveShopierWebhookNotificationUrl();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid app URL configuration.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const existing = await listShopierWebhookSubscriptions();
    const normalizedExpected = normalizeUrl(expectedUrl);
    const deleted: ShopierWebhookSubscription[] = [];
    const created: ShopierWebhookSubscription[] = [];

    for (const event of REQUIRED_EVENTS) {
      const eventSubscriptions = existing.filter((item) => item.event === event);
      let expectedExists = false;

      for (const subscription of eventSubscriptions) {
        const isExpectedUrl = normalizeUrl(subscription.url) === normalizedExpected;

        if (isExpectedUrl && !expectedExists) {
          expectedExists = true;
          continue;
        }

        await deleteShopierWebhookSubscription(subscription.id);
        deleted.push(subscription);

        const index = existing.findIndex((item) => item.id === subscription.id);
        if (index >= 0) {
          existing.splice(index, 1);
        }
      }

      if (expectedExists) {
        continue;
      }

      const createdSubscription = await createShopierWebhookSubscription(event, expectedUrl);
      created.push(createdSubscription);
      existing.push(createdSubscription);
    }

    const newTokens = created
      .map((item) => String(item.token || '').trim())
      .filter(Boolean);

    const health = await buildWebhookHealth();
    return NextResponse.json({
      ok: true,
      deletedCount: deleted.length,
      createdCount: created.length,
      deleted: deleted.map((item) => ({ id: item.id, event: item.event, url: item.url })),
      created: created.map((item) => ({ id: item.id, event: item.event, url: item.url })),
      newWebhookTokens: newTokens,
      newWebhookTokenCount: newTokens.length,
      expectedUrl,
      health,
    });
  } catch (error) {
    const shopierError = error as ShopierApiRequestError | null;
    const code = shopierError?.code || 'SHOPIER_API_ERROR';
    const message = shopierError?.message || 'Failed to sync Shopier webhooks.';

    const status =
      code === 'SHOPIER_PAT_MISSING' || code === 'SHOPIER_WEBHOOK_ID_MISSING'
        ? 400
        : code === 'SHOPIER_PAT_REVOKED'
          ? 401
          : 502;
    return NextResponse.json({ error: message, code }, { status });
  }
}

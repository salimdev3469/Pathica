import { supabaseAdmin } from '@/lib/supabase';
import {
  ADVANCED_AI_CREDIT_COST,
  BILLING_PACKAGES,
  FREE_SIGNUP_AI_CREDITS,
  FREE_SIGNUP_EXPORTS,
  PDF_EXPORT_CREDIT_COST,
  type BillingPackage,
  type BillingPackageCode,
} from '@/lib/billing-config';

export type WalletSnapshot = {
  userId: string;
  creditBalance: number;
  freeExportsRemaining: number;
};

export type BillingPaymentStatus = 'pending' | 'paid' | 'credited' | 'review_required' | 'rejected' | 'failed';

export type EntitlementConsumption = {
  ok: boolean;
  code: string;
  consumedCredits: number;
  consumedFreeExport: boolean;
  creditBalance: number;
  freeExportsRemaining: number;
  ledgerId: string | null;
};

export type BillingPayment = {
  id: string;
  user_id: string | null;
  buyer_email: string;
  package_code: BillingPackageCode;
  package_price_usd: number;
  credit_amount: number;
  status: BillingPaymentStatus;
  shopier_order_id: string | null;
  shopier_product_id: string | null;
  checkout_url: string | null;
  failure_reason: string | null;
  paid_at: string | null;
  credited_at: string | null;
  approved_at: string | null;
  approved_by_email: string | null;
  created_at: string;
  updated_at: string;
};

type RpcConsumeRow = {
  success: boolean;
  code: string;
  consumed_credits: number;
  consumed_free_export: boolean;
  credit_balance: number;
  free_exports_remaining: number;
  ledger_id: string | null;
};

type RpcGrantRow = {
  success: boolean;
  code: string;
  user_id: string | null;
  credit_balance: number;
  ledger_id: string | null;
};

type SupabaseErrorLike = {
  code?: string;
  message?: string;
} | null;

const BILLING_ADMIN_EMAILS = String(process.env.BILLING_ADMIN_EMAILS || '')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

export function normalizeEmail(email: string | null | undefined): string {
  return String(email || '').trim().toLowerCase();
}

export function isBillingAdminEmail(email: string | null | undefined): boolean {
  const normalized = normalizeEmail(email);
  return Boolean(normalized) && BILLING_ADMIN_EMAILS.includes(normalized);
}

export function isKnownBillingPackageCode(value: string | null | undefined): value is BillingPackageCode {
  if (!value) return false;
  return BILLING_PACKAGES.some((pkg) => pkg.code === value);
}

function rpcRow<T>(data: unknown): T | null {
  if (Array.isArray(data)) {
    return (data[0] as T) || null;
  }
  return (data as T) || null;
}

export async function ensureWalletForUser(userId: string, options?: { seedSignupDefaults?: boolean }): Promise<void> {
  const seedSignupDefaults = Boolean(options?.seedSignupDefaults);

  const payload = {
    user_id: userId,
    credit_balance: seedSignupDefaults ? FREE_SIGNUP_AI_CREDITS : 0,
    free_exports_remaining: seedSignupDefaults ? FREE_SIGNUP_EXPORTS : 0,
  };

  const { error } = await supabaseAdmin.from('credit_wallets').upsert(payload, {
    onConflict: 'user_id',
    ignoreDuplicates: true,
  });

  if (error) {
    throw error;
  }
}

export async function getWalletSnapshot(userId: string): Promise<WalletSnapshot> {
  await ensureWalletForUser(userId);

  const { data, error } = await supabaseAdmin
    .from('credit_wallets')
    .select('user_id,credit_balance,free_exports_remaining')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw error || new Error('Wallet not found');
  }

  return {
    userId: data.user_id,
    creditBalance: Number(data.credit_balance || 0),
    freeExportsRemaining: Number(data.free_exports_remaining || 0),
  };
}

async function consumeEntitlement(userId: string, feature: string, cost: number, allowFreeExport: boolean, metadata?: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin.rpc('consume_user_entitlement', {
    p_user_id: userId,
    p_feature: feature,
    p_credit_cost: cost,
    p_allow_free_export: allowFreeExport,
    p_metadata: metadata || {},
  });

  if (error) {
    throw error;
  }

  const row = rpcRow<RpcConsumeRow>(data);
  if (!row) {
    throw new Error('Entitlement consumption failed with an empty response.');
  }

  return {
    ok: Boolean(row.success),
    code: String(row.code || 'UNKNOWN'),
    consumedCredits: Number(row.consumed_credits || 0),
    consumedFreeExport: Boolean(row.consumed_free_export),
    creditBalance: Number(row.credit_balance || 0),
    freeExportsRemaining: Number(row.free_exports_remaining || 0),
    ledgerId: row.ledger_id,
  } satisfies EntitlementConsumption;
}

export async function consumeAdvancedAiCredit(userId: string, feature: string, metadata?: Record<string, unknown>) {
  return consumeEntitlement(userId, feature, ADVANCED_AI_CREDIT_COST, false, metadata);
}

export async function consumePdfExportCredit(userId: string, metadata?: Record<string, unknown>) {
  return consumeEntitlement(userId, 'pdf_export', PDF_EXPORT_CREDIT_COST, true, metadata);
}

export async function refundConsumption(
  userId: string,
  feature: string,
  consumedCredits: number,
  consumedFreeExport: boolean,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabaseAdmin.rpc('refund_user_entitlement', {
    p_user_id: userId,
    p_feature: feature,
    p_consumed_credits: consumedCredits,
    p_consumed_free_export: consumedFreeExport,
    p_metadata: metadata || {},
  });

  if (error) {
    throw error;
  }
}

export async function createPendingShopierPayment(input: {
  userId: string;
  buyerEmail: string;
  pkg: BillingPackage;
  checkoutUrl: string;
}) {
  const recentThreshold = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data: recentPending, error: recentPendingError } = await supabaseAdmin
    .from('shopier_payments')
    .select('*')
    .eq('user_id', input.userId)
    .eq('package_code', input.pkg.code)
    .eq('status', 'pending')
    .is('shopier_order_id', null)
    .gte('created_at', recentThreshold)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recentPendingError) {
    throw recentPendingError;
  }

  if (recentPending) {
    return recentPending as BillingPayment;
  }

  const { data, error } = await supabaseAdmin
    .from('shopier_payments')
    .insert({
      user_id: input.userId,
      buyer_email: normalizeEmail(input.buyerEmail),
      package_code: input.pkg.code,
      package_price_usd: input.pkg.priceUsd,
      credit_amount: input.pkg.credits,
      status: 'pending',
      checkout_url: input.checkoutUrl,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw error || new Error('Failed to create pending payment.');
  }

  return data as BillingPayment;
}

export async function getBillingPaymentForUser(paymentId: string, userId: string): Promise<BillingPayment | null> {
  const { data, error } = await supabaseAdmin
    .from('shopier_payments')
    .select('*')
    .eq('id', paymentId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as BillingPayment | null) || null;
}

export async function getBillingPaymentById(paymentId: string): Promise<BillingPayment | null> {
  const { data, error } = await supabaseAdmin.from('shopier_payments').select('*').eq('id', paymentId).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as BillingPayment | null) || null;
}

export async function resolveUserIdForBillingEmail(email: string | null | undefined): Promise<string | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return null;
  }

  const { data: fromPayments, error: paymentsError } = await supabaseAdmin
    .from('shopier_payments')
    .select('user_id')
    .eq('buyer_email', normalized)
    .not('user_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paymentsError) {
    throw paymentsError;
  }

  const mappedFromPayments = String(fromPayments?.user_id || '').trim();
  if (mappedFromPayments) {
    return mappedFromPayments;
  }

  const findInAuthUsers = async (caseInsensitive: boolean) => {
    const query = supabaseAdmin.schema('auth').from('users').select('id').limit(1);
    const { data, error } = caseInsensitive
      ? await query.ilike('email', normalized).maybeSingle()
      : await query.eq('email', normalized).maybeSingle();

    if (error) {
      return null;
    }

    return String(data?.id || '').trim() || null;
  };

  const exact = await findInAuthUsers(false);
  if (exact) {
    return exact;
  }

  return findInAuthUsers(true);
}

export async function getUserBillingPayments(userId: string, limit = 10): Promise<BillingPayment[]> {
  const { data, error } = await supabaseAdmin
    .from('shopier_payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  const payments = (data as BillingPayment[]) || [];
  return Promise.all(payments.map((payment) => reconcileCreditedPaymentRecord(payment)));
}

export async function getUserLedger(userId: string, limit = 20) {
  const { data, error } = await supabaseAdmin
    .from('credit_ledger')
    .select('id,delta,reason,feature,metadata,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function grantCreditsForPayment(paymentId: string, reason?: string) {
  const appliedReason = reason || 'shopier_package_purchase';
  const existingPayment = await getBillingPaymentById(paymentId);
  if (!existingPayment) {
    return {
      success: false,
      code: 'PAYMENT_NOT_FOUND',
      userId: null,
      creditBalance: 0,
      ledgerId: null,
    };
  }

  if (!existingPayment.user_id) {
    return {
      success: false,
      code: 'USER_NOT_MAPPED',
      userId: null,
      creditBalance: 0,
      ledgerId: null,
    };
  }

  if (!['paid', 'credited'].includes(existingPayment.status)) {
    return {
      success: false,
      code: 'PAYMENT_NOT_PAID',
      userId: existingPayment.user_id,
      creditBalance: 0,
      ledgerId: null,
    };
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('grant_credits_for_payment', {
      p_payment_id: paymentId,
      p_reason: appliedReason,
    });

    if (error) {
      throw error;
    }

    const row = rpcRow<RpcGrantRow>(data);
    if (!row) {
      throw new Error('Credit grant failed with an empty response.');
    }

    return {
      success: Boolean(row.success),
      code: String(row.code || 'UNKNOWN'),
      userId: row.user_id,
      creditBalance: Number(row.credit_balance || 0),
      ledgerId: row.ledger_id,
    };
  } catch (error) {
    const asRecord = (error || null) as SupabaseErrorLike;
    const isAmbiguousLegacyError =
      asRecord?.code === '42702' && String(asRecord.message || '').includes('column reference "user_id" is ambiguous');

    if (!isAmbiguousLegacyError) {
      throw error;
    }

    // Fallback for environments where the SQL function is outdated.
    return grantCreditsForPaymentFallback(paymentId, appliedReason);
  }
}

export async function markPaymentPaid(input: {
  paymentId: string;
  shopierOrderId: string;
  shopierProductId: string;
  failureReason?: string | null;
  userId?: string | null;
}) {
  const payload: Record<string, unknown> = {
    status: 'paid',
    shopier_order_id: input.shopierOrderId,
    shopier_product_id: input.shopierProductId,
    paid_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    failure_reason: input.failureReason ?? null,
  };

  if (input.userId) {
    payload.user_id = input.userId;
  }

  const { data, error } = await supabaseAdmin
    .from('shopier_payments')
    .update(payload)
    .eq('id', input.paymentId)
    .neq('status', 'credited')
    .select('*')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as BillingPayment | null) || null;
}

export async function findPendingPaymentByEmailAndPackage(input: {
  buyerEmail: string;
  packageCode: BillingPackageCode;
}) {
  const list = await listPendingPaymentsByEmailAndPackage({ ...input, limit: 1 });
  return list[0] || null;
}

export async function listPendingPaymentsByEmailAndPackage(input: {
  buyerEmail: string;
  packageCode: BillingPackageCode;
  limit?: number;
}) {
  const safeLimit = Number.isFinite(input.limit) ? Math.max(1, Math.min(20, Math.floor(input.limit || 1))) : 1;
  const { data, error } = await supabaseAdmin
    .from('shopier_payments')
    .select('*')
    .eq('buyer_email', normalizeEmail(input.buyerEmail))
    .eq('package_code', input.packageCode)
    .eq('status', 'pending')
    .is('shopier_order_id', null)
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw error;
  }

  return (data as BillingPayment[]) || [];
}

export async function listPendingPaymentsByPackage(input: { packageCode: BillingPackageCode; limit?: number }) {
  const safeLimit = Number.isFinite(input.limit) ? Math.max(1, Math.min(30, Math.floor(input.limit || 1))) : 1;
  const { data, error } = await supabaseAdmin
    .from('shopier_payments')
    .select('*')
    .eq('package_code', input.packageCode)
    .eq('status', 'pending')
    .is('shopier_order_id', null)
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw error;
  }

  return (data as BillingPayment[]) || [];
}

export async function findPaymentByShopierOrderId(orderId: string) {
  const { data, error } = await supabaseAdmin
    .from('shopier_payments')
    .select('*')
    .eq('shopier_order_id', orderId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as BillingPayment | null) || null;
}

export async function createReviewPaymentFromWebhook(input: {
  userId?: string;
  buyerEmail: string;
  packageCode: BillingPackageCode;
  packagePriceUsd: number;
  credits: number;
  shopierOrderId: string;
  shopierProductId: string;
  failureReason?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from('shopier_payments')
    .insert({
      user_id: input.userId || null,
      buyer_email: normalizeEmail(input.buyerEmail),
      package_code: input.packageCode,
      package_price_usd: input.packagePriceUsd,
      credit_amount: input.credits,
      status: 'review_required',
      shopier_order_id: input.shopierOrderId,
      shopier_product_id: input.shopierProductId,
      paid_at: new Date().toISOString(),
      failure_reason: input.failureReason || 'manual_review_required',
    })
    .select('*')
    .single();

  if (error || !data) {
    throw error || new Error('Failed to create review payment.');
  }

  return data as BillingPayment;
}

export async function upsertWebhookEvent(input: {
  webhookId: string;
  event: string;
  payload: unknown;
}) {
  const { data, error } = await supabaseAdmin
    .from('shopier_webhook_events')
    .upsert(
      {
        webhook_id: input.webhookId,
        event: input.event,
        payload: input.payload as object,
        status: 'received',
      },
      { onConflict: 'webhook_id', ignoreDuplicates: true },
    )
    .select('*')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

export async function markWebhookEventProcessed(webhookId: string, status: 'processed' | 'ignored' | 'failed', errorMessage?: string) {
  const { error } = await supabaseAdmin
    .from('shopier_webhook_events')
    .update({
      status,
      error_message: errorMessage || null,
      processed_at: new Date().toISOString(),
    })
    .eq('webhook_id', webhookId);

  if (error) {
    throw error;
  }
}

export async function listAdminPayments(statuses?: BillingPaymentStatus[]) {
  let query = supabaseAdmin
    .from('shopier_payments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (statuses && statuses.length > 0) {
    query = query.in('status', statuses);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data as BillingPayment[]) || [];
}

export async function markPaymentManualApproved(input: {
  paymentId: string;
  adminEmail: string;
  userId?: string;
  shopierOrderId?: string;
  shopierProductId?: string;
}) {
  const payload: Record<string, unknown> = {
    status: 'paid',
    approved_at: new Date().toISOString(),
    approved_by_email: normalizeEmail(input.adminEmail),
    updated_at: new Date().toISOString(),
    paid_at: new Date().toISOString(),
    failure_reason: null,
  };

  if (input.userId) payload.user_id = input.userId;
  if (input.shopierOrderId) payload.shopier_order_id = input.shopierOrderId;
  if (input.shopierProductId) payload.shopier_product_id = input.shopierProductId;

  const { data, error } = await supabaseAdmin
    .from('shopier_payments')
    .update(payload)
    .eq('id', input.paymentId)
    .neq('status', 'credited')
    .select('*')
    .single();

  if (error || !data) {
    throw error || new Error('Failed to mark payment as manually approved.');
  }

  return data as BillingPayment;
}

export async function markPaymentRejected(input: { paymentId: string; adminEmail: string; reason?: string }) {
  const { data, error } = await supabaseAdmin
    .from('shopier_payments')
    .update({
      status: 'rejected',
      approved_at: new Date().toISOString(),
      approved_by_email: normalizeEmail(input.adminEmail),
      updated_at: new Date().toISOString(),
      failure_reason: input.reason || 'manually_rejected',
    })
    .eq('id', input.paymentId)
    .neq('status', 'credited')
    .select('*')
    .single();

  if (error || !data) {
    throw error || new Error('Failed to reject payment.');
  }

  return data as BillingPayment;
}

export function publicBillingPackages() {
  return BILLING_PACKAGES.map((pkg) => ({
    code: pkg.code,
    name: pkg.name,
    credits: pkg.credits,
    priceUsd: pkg.priceUsd,
    highlight: Boolean(pkg.highlight),
  }));
}

export function getBillingSummaryText() {
  return 'No subscription. One-time purchase. USD fixed pricing.';
}

async function grantCreditsForPaymentFallback(paymentId: string, reason: string) {
  const payment = await getBillingPaymentById(paymentId);
  if (!payment) {
    return {
      success: false,
      code: 'PAYMENT_NOT_FOUND',
      userId: null,
      creditBalance: 0,
      ledgerId: null,
    };
  }

  if (!payment.user_id) {
    return {
      success: false,
      code: 'USER_NOT_MAPPED',
      userId: null,
      creditBalance: 0,
      ledgerId: null,
    };
  }

  if (payment.status === 'credited') {
    const wallet = await getWalletSnapshot(payment.user_id);
    return {
      success: true,
      code: 'ALREADY_CREDITED',
      userId: payment.user_id,
      creditBalance: wallet.creditBalance,
      ledgerId: null,
    };
  }

  if (payment.status !== 'paid') {
    return {
      success: false,
      code: 'PAYMENT_NOT_PAID',
      userId: payment.user_id,
      creditBalance: 0,
      ledgerId: null,
    };
  }

  const { data: existingLedger, error: existingLedgerError } = await supabaseAdmin
    .from('credit_ledger')
    .select('id')
    .eq('user_id', payment.user_id)
    .eq('reason', reason)
    .contains('metadata', { payment_id: payment.id })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingLedgerError) {
    throw existingLedgerError;
  }

  if (existingLedger?.id) {
    await supabaseAdmin
      .from('shopier_payments')
      .update({
        status: 'credited',
        credited_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id)
      .neq('status', 'credited');

    const wallet = await getWalletSnapshot(payment.user_id);
    return {
      success: true,
      code: 'ALREADY_CREDITED',
      userId: payment.user_id,
      creditBalance: wallet.creditBalance,
      ledgerId: existingLedger.id,
    };
  }

  const walletBefore = await getWalletSnapshot(payment.user_id);
  const creditedAt = new Date().toISOString();
  const targetBalance = walletBefore.creditBalance + Number(payment.credit_amount || 0);

  const { error: walletUpdateError } = await supabaseAdmin
    .from('credit_wallets')
    .update({
      credit_balance: targetBalance,
      updated_at: creditedAt,
    })
    .eq('user_id', payment.user_id);

  if (walletUpdateError) {
    throw walletUpdateError;
  }

  const { data: createdLedger, error: ledgerInsertError } = await supabaseAdmin
    .from('credit_ledger')
    .insert({
      user_id: payment.user_id,
      delta: Number(payment.credit_amount || 0),
      reason,
      feature: payment.package_code,
      metadata: {
        payment_id: payment.id,
        shopier_order_id: payment.shopier_order_id,
        package_code: payment.package_code,
      },
    })
    .select('id')
    .single();

  if (ledgerInsertError) {
    throw ledgerInsertError;
  }

  const { error: paymentUpdateError } = await supabaseAdmin
    .from('shopier_payments')
    .update({
      status: 'credited',
      credited_at: creditedAt,
      updated_at: creditedAt,
    })
    .eq('id', payment.id)
    .neq('status', 'credited');

  if (paymentUpdateError) {
    throw paymentUpdateError;
  }

  return {
    success: true,
    code: 'OK',
    userId: payment.user_id,
    creditBalance: targetBalance,
    ledgerId: createdLedger?.id || null,
  };
}

async function reconcileCreditedPaymentRecord(payment: BillingPayment): Promise<BillingPayment> {
  if (!payment.user_id || payment.status === 'credited') {
    return payment;
  }

  const { data: ledgerHit, error: ledgerError } = await supabaseAdmin
    .from('credit_ledger')
    .select('id,created_at')
    .eq('user_id', payment.user_id)
    .eq('delta', payment.credit_amount)
    .contains('metadata', { payment_id: payment.id })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (ledgerError || !ledgerHit?.id) {
    return payment;
  }

  const creditedAt = String(ledgerHit.created_at || new Date().toISOString());
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('shopier_payments')
    .update({
      status: 'credited',
      credited_at: payment.credited_at || creditedAt,
      paid_at: payment.paid_at || creditedAt,
      updated_at: new Date().toISOString(),
      failure_reason: payment.failure_reason || null,
    })
    .eq('id', payment.id)
    .in('status', ['pending', 'paid'])
    .select('*')
    .maybeSingle();

  if (updateError || !updated) {
    return payment;
  }

  return updated as BillingPayment;
}

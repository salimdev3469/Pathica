import { supabaseAdmin } from '@/lib/supabase';
import {
  BILLING_PACKAGES,
  FREE_SIGNUP_AI_CREDITS,
  FREE_SIGNUP_EXPORTS,
  PDF_EXPORT_CREDIT_COST,
  getAdvancedAiCreditCost,
  type BillingPackage,
  type BillingPackageCode,
} from '@/lib/billing-config';

type Locale = 'en' | 'tr';

export type WalletSnapshot = {
  userId: string;
  creditBalance: number;
  freeExportsRemaining: number;
};

export type EntitlementConsumption = {
  ok: boolean;
  code: string;
  consumedCredits: number;
  consumedFreeExport: boolean;
  creditBalance: number;
  freeExportsRemaining: number;
  ledgerId: string | null;
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
  return consumeEntitlement(userId, feature, getAdvancedAiCreditCost(feature), false, metadata);
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

export function publicBillingPackages() {
  return BILLING_PACKAGES.map((pkg) => ({
    code: pkg.code,
    name: pkg.name,
    credits: pkg.credits,
    priceUsd: pkg.priceUsd,
    highlight: Boolean(pkg.highlight),
  }));
}

export function getBillingSummaryText(locale: Locale = 'en') {
  if (locale === 'tr') {
    return 'Abonelik yok. Tek seferlik satın alma. Sabit TL fiyatlandırma.';
  }

  return 'No subscription. One-time purchase. TRY fixed pricing.';
}

export type DodoPaymentStatus = 'pending' | 'paid' | 'credited' | 'refunded' | 'failed' | 'disputed';

export type DodoPayment = {
  id: string;
  user_id: string | null;
  buyer_email: string;
  package_code: string;
  package_price: number;
  currency: string;
  credit_amount: number;
  status: DodoPaymentStatus;
  dodo_session_id: string | null;
  dodo_payment_id: string | null;
  dodo_customer_id: string | null;
  billing_type: string;
  checkout_url: string | null;
  metadata: Record<string, unknown> | null;
  failure_reason: string | null;
  paid_at: string | null;
  credited_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function createPendingDodoPayment(input: {
  userId: string;
  buyerEmail: string;
  pkg: import('@/lib/billing-config').BillingPackage;
  sessionId: string;
  checkoutUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<DodoPayment> {
  const { data, error } = await supabaseAdmin
    .from('dodo_payments')
    .insert({
      user_id: input.userId,
      buyer_email: normalizeEmail(input.buyerEmail),
      package_code: input.pkg.code,
      package_price: input.pkg.priceUsd,
      currency: 'TRY',
      credit_amount: input.pkg.credits,
      status: 'pending',
      dodo_session_id: input.sessionId,
      checkout_url: input.checkoutUrl,
      billing_type: 'one_time',
      metadata: input.metadata || null,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw error || new Error('Failed to create pending payment.');
  }

  return data as DodoPayment;
}

export async function findDodoPaymentByProviderPaymentId(providerPaymentId: string): Promise<DodoPayment | null> {
  const { data, error } = await supabaseAdmin
    .from('dodo_payments')
    .select('*')
    .eq('dodo_payment_id', providerPaymentId)
    .maybeSingle();

  if (error) throw error;
  return (data as DodoPayment | null) || null;
}

export async function findDodoPaymentBySessionId(sessionId: string): Promise<DodoPayment | null> {
  const { data, error } = await supabaseAdmin
    .from('dodo_payments')
    .select('*')
    .eq('dodo_session_id', sessionId)
    .maybeSingle();

  if (error) throw error;
  return (data as DodoPayment | null) || null;
}

export async function markDodoPaymentPaid(input: {
  providerPaymentId: string;
  providerSessionId?: string;
  providerCustomerId?: string;
  amount?: number;
  currency?: string;
}): Promise<DodoPayment | null> {
  let payment = await findDodoPaymentByProviderPaymentId(input.providerPaymentId);
  
  if (!payment && input.providerSessionId) {
    payment = await findDodoPaymentBySessionId(input.providerSessionId);
  }

  if (!payment) {
    console.warn(`No matching payment found for Dodo payment ID: ${input.providerPaymentId}`);
    return null;
  }

  if (payment.status === 'credited' || payment.status === 'paid') {
    return payment;
  }

  const updatePayload: Record<string, unknown> = {
    status: 'paid',
    dodo_payment_id: input.providerPaymentId,
    paid_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (input.providerCustomerId) {
    updatePayload.dodo_customer_id = input.providerCustomerId;
  }

  const { data, error } = await supabaseAdmin
    .from('dodo_payments')
    .update(updatePayload)
    .eq('id', payment.id)
    .neq('status', 'credited')
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return (data as DodoPayment | null) || null;
}

export async function markDodoPaymentFailed(providerPaymentId: string, reason: string): Promise<void> {
  const payment = await findDodoPaymentByProviderPaymentId(providerPaymentId);
  if (!payment || payment.status === 'credited') return;

  await supabaseAdmin
    .from('dodo_payments')
    .update({
      status: 'failed',
      dodo_payment_id: providerPaymentId,
      failure_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id)
    .neq('status', 'credited');
}

export async function markDodoPaymentRefunded(providerPaymentId: string): Promise<void> {
  const payment = await findDodoPaymentByProviderPaymentId(providerPaymentId);
  if (!payment) return;

  if (payment.status === 'credited' && payment.user_id) {
    const { error: walletError } = await supabaseAdmin
      .from('credit_wallets')
      .update({
        credit_balance: Math.max(0, (await getWalletSnapshot(payment.user_id)).creditBalance - payment.credit_amount),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', payment.user_id);

    if (!walletError) {
      await supabaseAdmin.from('credit_ledger').insert({
        user_id: payment.user_id,
        delta: -payment.credit_amount,
        reason: 'dodo_refund',
        feature: payment.package_code,
        metadata: {
          payment_id: payment.id,
          dodo_payment_id: providerPaymentId,
        },
      });
    }
  }

  await supabaseAdmin
    .from('dodo_payments')
    .update({
      status: 'refunded',
      refunded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id);
}

export async function grantCreditsForDodoPayment(paymentId: string, reason?: string): Promise<{
  success: boolean;
  code: string;
  userId: string | null;
  creditBalance: number;
  ledgerId: string | null;
}> {
  const appliedReason = reason || 'dodo_package_purchase';
  
  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('dodo_payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (paymentError || !payment) {
    return { success: false, code: 'PAYMENT_NOT_FOUND', userId: null, creditBalance: 0, ledgerId: null };
  }

  const typedPayment = payment as DodoPayment;

  if (!typedPayment.user_id) {
    return { success: false, code: 'USER_NOT_MAPPED', userId: null, creditBalance: 0, ledgerId: null };
  }

  if (typedPayment.status === 'credited') {
    const wallet = await getWalletSnapshot(typedPayment.user_id);
    return { success: true, code: 'ALREADY_CREDITED', userId: typedPayment.user_id, creditBalance: wallet.creditBalance, ledgerId: null };
  }

  if (!['paid', 'pending'].includes(typedPayment.status)) {
    return { success: false, code: 'PAYMENT_NOT_PAID', userId: typedPayment.user_id, creditBalance: 0, ledgerId: null };
  }

  const { data: existingLedger } = await supabaseAdmin
    .from('credit_ledger')
    .select('id')
    .eq('user_id', typedPayment.user_id)
    .eq('reason', appliedReason)
    .contains('metadata', { payment_id: typedPayment.id })
    .limit(1)
    .maybeSingle();

  if (existingLedger?.id) {
    await supabaseAdmin
      .from('dodo_payments')
      .update({ status: 'credited', credited_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', typedPayment.id);

    const wallet = await getWalletSnapshot(typedPayment.user_id);
    return { success: true, code: 'ALREADY_CREDITED', userId: typedPayment.user_id, creditBalance: wallet.creditBalance, ledgerId: existingLedger.id };
  }

  await ensureWalletForUser(typedPayment.user_id);

  const walletBefore = await getWalletSnapshot(typedPayment.user_id);
  const targetBalance = walletBefore.creditBalance + typedPayment.credit_amount;
  const creditedAt = new Date().toISOString();

  const { error: walletUpdateError } = await supabaseAdmin
    .from('credit_wallets')
    .update({ credit_balance: targetBalance, updated_at: creditedAt })
    .eq('user_id', typedPayment.user_id);

  if (walletUpdateError) throw walletUpdateError;

  const { data: createdLedger, error: ledgerInsertError } = await supabaseAdmin
    .from('credit_ledger')
    .insert({
      user_id: typedPayment.user_id,
      delta: typedPayment.credit_amount,
      reason: appliedReason,
      feature: typedPayment.package_code,
      metadata: {
        payment_id: typedPayment.id,
        dodo_payment_id: typedPayment.dodo_payment_id,
        dodo_session_id: typedPayment.dodo_session_id,
        package_code: typedPayment.package_code,
      },
    })
    .select('id')
    .single();

  if (ledgerInsertError) throw ledgerInsertError;

  await supabaseAdmin
    .from('dodo_payments')
    .update({ status: 'credited', credited_at: creditedAt, updated_at: creditedAt })
    .eq('id', typedPayment.id);

  return {
    success: true,
    code: 'OK',
    userId: typedPayment.user_id,
    creditBalance: targetBalance,
    ledgerId: createdLedger?.id || null,
  };
}

export async function getUserBillingPayments(userId: string, limit = 10): Promise<DodoPayment[]> {
  const { data, error } = await supabaseAdmin
    .from('dodo_payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as DodoPayment[]) || [];
}

export async function upsertDodoWebhookEvent(input: {
  webhookId: string;
  eventType: string;
  payload: unknown;
}) {
  const { data, error } = await supabaseAdmin
    .from('dodo_webhook_events')
    .upsert(
      {
        webhook_id: input.webhookId,
        event_type: input.eventType,
        payload: input.payload as object,
        status: 'received',
      },
      { onConflict: 'webhook_id', ignoreDuplicates: true },
    )
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

export async function markDodoWebhookEventProcessed(
  webhookId: string,
  status: 'processed' | 'ignored' | 'failed',
  errorMessage?: string,
) {
  const { error } = await supabaseAdmin
    .from('dodo_webhook_events')
    .update({
      status,
      error_message: errorMessage || null,
      processed_at: new Date().toISOString(),
    })
    .eq('webhook_id', webhookId);

  if (error) throw error;
}

export type BillingPaymentStatus = DodoPaymentStatus;

export async function listAdminPayments(statuses?: BillingPaymentStatus[]): Promise<DodoPayment[]> {
  let query = supabaseAdmin
    .from('dodo_payments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (statuses && statuses.length > 0) {
    query = query.in('status', statuses);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as DodoPayment[]) || [];
}

export async function getBillingPaymentById(id: string): Promise<DodoPayment | null> {
  const { data, error } = await supabaseAdmin
    .from('dodo_payments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return (data as DodoPayment | null) || null;
}

export async function resolveUserIdForBillingEmail(email: string): Promise<string | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const { data } = await supabaseAdmin
    .from('users') // assuming auth.users isn't directly queryable without rpc, but let's try public.users if exists
    .select('id')
    .eq('email', normalized)
    .maybeSingle();

  return data?.id || null;
}

export async function markPaymentManualApproved(input: {
  paymentId: string;
  adminEmail: string;
  userId?: string;
  dodoPaymentId?: string;
}) {
  const payload: Record<string, unknown> = {
    status: 'paid',
    paid_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (input.userId) {
    payload.user_id = input.userId;
  }
  if (input.dodoPaymentId) {
    payload.dodo_payment_id = input.dodoPaymentId;
  }

  const { error } = await supabaseAdmin
    .from('dodo_payments')
    .update(payload)
    .eq('id', input.paymentId)
    .neq('status', 'credited');

  if (error) throw error;
}

export async function markPaymentRejected(input: {
  paymentId: string;
  adminEmail: string;
  reason?: string;
}) {
  const { error } = await supabaseAdmin
    .from('dodo_payments')
    .update({
      status: 'rejected',
      failure_reason: `Rejected by admin ${input.adminEmail}: ${input.reason || 'No reason provided'}`,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.paymentId)
    .neq('status', 'credited');

  if (error) throw error;
}


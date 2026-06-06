export type BillingPackageCode = 'starter' | 'pro' | 'mega';

export type BillingPackage = {
  code: BillingPackageCode;
  name: string;
  credits: number;
  priceUsd: number;
  highlight?: boolean;
  dodoProductIdEnv: string;
};

export const FREE_SIGNUP_AI_CREDITS = 10;
export const FREE_SIGNUP_EXPORTS = 1;
export const ADVANCED_AI_CREDIT_COST = 10;
export const COVER_LETTER_CREDIT_COST = 15;
export const PDF_EXPORT_CREDIT_COST = 25;
export const AI_REVIEW_FIX_CREDIT_COST = 35;
export const ADVANCED_AI_FEATURE_CREDIT_COSTS = {
  tailor: ADVANCED_AI_CREDIT_COST,
  generate_from_job: ADVANCED_AI_CREDIT_COST,
  cover_letter: COVER_LETTER_CREDIT_COST,
  ai_review_fix: AI_REVIEW_FIX_CREDIT_COST,
} as const;
export const PENDING_MATCH_WINDOW_MINUTES = numberFromEnv('BILLING_PENDING_MATCH_WINDOW_MINUTES', 180);
export const RETURN_RECONCILE_WINDOW_MINUTES = numberFromEnv('BILLING_RETURN_RECONCILE_WINDOW_MINUTES', 720);

export const BILLING_PACKAGES: BillingPackage[] = [
  {
    code: 'starter',
    name: 'Starter Pack',
    credits: 150,
    priceUsd: 9.99,
    dodoProductIdEnv: 'DODO_PRODUCT_ID_STARTER',
  },
  {
    code: 'pro',
    name: 'Job Hunter Pack',
    credits: 500,
    priceUsd: 24.99,
    highlight: true,
    dodoProductIdEnv: 'DODO_PRODUCT_ID_PRO',
  },
  {
    code: 'mega',
    name: 'Career Boost Pack',
    credits: 1200,
    priceUsd: 49.99,
    dodoProductIdEnv: 'DODO_PRODUCT_ID_MEGA',
  },
];

export function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getBillingPackageByCode(code: string | null | undefined): BillingPackage | null {
  if (!code) return null;
  return BILLING_PACKAGES.find((pkg) => pkg.code === code) || null;
}

export function getBillingPackageByProductId(productId: string | null | undefined): BillingPackage | null {
  if (!productId) return null;

  for (const pkg of BILLING_PACKAGES) {
    const configuredId = process.env[pkg.dodoProductIdEnv];
    if (configuredId && configuredId === productId) {
      return pkg;
    }
  }

  return null;
}

export function getDodoProductId(pkg: BillingPackage): string | null {
  const value = process.env[pkg.dodoProductIdEnv];
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getAdvancedAiCreditCost(feature: string): number {
  const cost = ADVANCED_AI_FEATURE_CREDIT_COSTS[feature as keyof typeof ADVANCED_AI_FEATURE_CREDIT_COSTS];
  return Number.isFinite(cost) ? cost : ADVANCED_AI_CREDIT_COST;
}

function numberFromEnv(key: string, fallback: number): number {
  const raw = String(process.env[key] || '').trim();
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

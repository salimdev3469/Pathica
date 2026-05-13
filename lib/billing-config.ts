export type BillingPackageCode = 'starter' | 'pro' | 'mega';

export type BillingPackage = {
  code: BillingPackageCode;
  name: string;
  credits: number;
  priceUsd: number;
  highlight?: boolean;
  shopierProductIdEnv: string;
  shopierProductUrlEnv: string;
};

export const FREE_SIGNUP_AI_CREDITS = 10;
export const FREE_SIGNUP_EXPORTS = 1;
export const ADVANCED_AI_CREDIT_COST = 1;
export const PDF_EXPORT_CREDIT_COST = 20;
export const PENDING_MATCH_WINDOW_MINUTES = numberFromEnv('BILLING_PENDING_MATCH_WINDOW_MINUTES', 180);
export const RETURN_RECONCILE_WINDOW_MINUTES = numberFromEnv('BILLING_RETURN_RECONCILE_WINDOW_MINUTES', 720);

export const BILLING_PACKAGES: BillingPackage[] = [
  {
    code: 'starter',
    name: 'Starter',
    credits: 100,
    priceUsd: 4.99,
    shopierProductIdEnv: 'SHOPIER_PRODUCT_ID_STARTER',
    shopierProductUrlEnv: 'SHOPIER_PRODUCT_URL_STARTER',
  },
  {
    code: 'pro',
    name: 'Pro',
    credits: 300,
    priceUsd: 9.99,
    highlight: true,
    shopierProductIdEnv: 'SHOPIER_PRODUCT_ID_PRO',
    shopierProductUrlEnv: 'SHOPIER_PRODUCT_URL_PRO',
  },
  {
    code: 'mega',
    name: 'Mega',
    credits: 1000,
    priceUsd: 19.99,
    shopierProductIdEnv: 'SHOPIER_PRODUCT_ID_MEGA',
    shopierProductUrlEnv: 'SHOPIER_PRODUCT_URL_MEGA',
  },
];

export function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function getBillingPackageByCode(code: string | null | undefined): BillingPackage | null {
  if (!code) return null;
  return BILLING_PACKAGES.find((pkg) => pkg.code === code) || null;
}

export function getBillingPackageByProductId(productId: string | null | undefined): BillingPackage | null {
  if (!productId) return null;

  for (const pkg of BILLING_PACKAGES) {
    const configuredId = process.env[pkg.shopierProductIdEnv];
    if (configuredId && configuredId === productId) {
      return pkg;
    }
  }

  return null;
}

export function getShopierCheckoutUrl(pkg: BillingPackage): string | null {
  const value = process.env[pkg.shopierProductUrlEnv];
  if (!value) return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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

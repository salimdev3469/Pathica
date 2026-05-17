export const COOKIE_CONSENT_COOKIE_NAME = 'pathica_cookie_preferences';
export const COOKIE_CONSENT_OPEN_PANEL_EVENT = 'pathica:open-cookie-settings';
export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

export type CookieConsentPreferences = {
  version: number;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

type CookieConsentDraft = {
  analytics: boolean;
  marketing: boolean;
};

export function buildCookieConsentPreferences(draft: CookieConsentDraft): CookieConsentPreferences {
  return {
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    analytics: draft.analytics,
    marketing: draft.marketing,
    updatedAt: new Date().toISOString(),
  };
}

export function serializeCookieConsentPreferences(preferences: CookieConsentPreferences): string {
  return encodeURIComponent(JSON.stringify(preferences));
}

export function parseCookieConsentPreferences(
  rawValue: string | null | undefined,
): CookieConsentPreferences | null {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(rawValue)) as Partial<CookieConsentPreferences>;
    if (
      parsed.version !== COOKIE_CONSENT_VERSION ||
      parsed.necessary !== true ||
      typeof parsed.analytics !== 'boolean' ||
      typeof parsed.marketing !== 'boolean' ||
      typeof parsed.updatedAt !== 'string'
    ) {
      return null;
    }

    return {
      version: parsed.version,
      necessary: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export function getClientCookieValue(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const key = `${name}=`;
  const row = document.cookie
    .split('; ')
    .find((item) => item.startsWith(key));

  return row ? row.slice(key.length) : null;
}

export function setClientCookie(name: string, value: string, maxAgeSeconds = COOKIE_CONSENT_MAX_AGE_SECONDS) {
  if (typeof document === 'undefined') {
    return;
  }

  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secureSuffix = isSecure ? '; Secure' : '';
  document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secureSuffix}`;
}
